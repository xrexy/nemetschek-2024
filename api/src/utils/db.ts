import { WAREHOUSE_TIME_FOR_FULL_CHARGE } from "./simulation";
import { createHistoryEvent } from "../types/history";
import { distanceBetween } from "./distance";

import type { HistoryEventPayloads, HistoryEvents } from "../types/history";
import type { Drone } from "../types/drone";
import type { Order } from "../types/order";
import type { SimulationData } from "../types/simulation";
import type { InputWarehouse, Warehouse } from "../types/warehouse";
import type { Position } from "../types/position";
import { Customer } from "../types/customer";

type DB = {
  history: ReturnType<typeof memoryDbHistory>,
  order: ReturnType<typeof memoryDbOrder>,
  drone: ReturnType<typeof memoryDbDrone>,
  warehouse: ReturnType<typeof memoryDbWarehouse>
}

export const memoryDbHistory = (data: SimulationData) => ({
  addEvent: <Event extends HistoryEvents>(event: Event, payload: HistoryEventPayloads[Event], ts?: number) => {
    console.debug(`[${data.slug}] Created history event: ${event}`)
    data.history.data.push(createHistoryEvent(event, payload, ts));
  }
})

export const memoryDbOrder = (data: SimulationData) => ({
  getWithStatus: (status: Order['status'], arr = data.orders) => {
    return arr.filter(order => order.status === status);
  },

  getWithId: (id: number, arr = data.orders) => {
    // can't be a simple array lookup, because orders are removed from the array
    return arr.find(order => order.id === id);
  }
})

export const memoryDbDrone = (data: SimulationData) => ({
  getWithStatus: (status: Drone['status'], arr = data.drones) => {
    return arr.filter(drone => drone.status === status);
  },

  getWithId: (id: number, arr = data.drones) => {
    return arr[id];
  },

  sendToOrder: (history: DB['history'], drone: Drone, droneWarehouse: Warehouse, order: Order, distance: number, ts = Date.now()) => {
    drone.status = 'delivering';
    drone.statusData = {
      delivering: {
        distance,
        orderId: order.id,
        startedAt: ts,
        distanceCovered: 0
      }
    }

    history.addEvent('drone-sent', {
      order: {
        id: order.id,
        customerId: order.customer.id,
        productList: order.productList
      },
      droneId: drone.id,
      warehouseId: droneWarehouse.id,
      distance,
    })

    order.status = 'assigned';
    order.statusData = {
      assigned: {
        droneId: drone.id,
        startedAt: ts
      }
    }

    droneWarehouse.droneIds = droneWarehouse.droneIds.filter(id => id !== drone.id);
  },

  updateBatteryCharge: ({ order: orderDb, history }: {
    order: DB['order'],
    history: DB['history']
  }, drone: Drone, programDiff: number) => {
    const currentCharge = drone.battery.currentCharge;
    const maxCharge = drone.battery.capacity;

    let newCharge = currentCharge;

    // if idle(in warehouse), calculate how much it's charged
    if (drone.status === 'idle') {
      if (drone.battery.currentCharge === maxCharge) return;

      const chargePerTick = maxCharge / WAREHOUSE_TIME_FOR_FULL_CHARGE; // 20 program minutes = full charge
      const chargedInThisTick = chargePerTick * programDiff;

      newCharge += chargedInThisTick;
      if (newCharge >= maxCharge) {
        newCharge = maxCharge;
      }

      history.addEvent('drone-battery-update', {
        newCharge,
        droneId: drone.id,
        oldCharge: currentCharge
      })

    }

    // if travelling, calculate how much it's consumed
    if (drone.status === 'delivering' || drone.status === 'returning') {
      const { distanceCovered, distance } = drone.statusData[drone.status]!;
      const orderId = drone.statusData.delivering?.orderId
      const order = orderId ? orderDb.getWithId(orderId)! : undefined;

      const consumptionPerDistance = drone.battery.consumption;
      const weight = order?.weight ?? 0;
      const distanceBatteryConsumption = distanceCovered / distance * consumptionPerDistance;
      const weightBatteryConsumption = weight;

      const totalBatteryConsumption = distanceBatteryConsumption + weightBatteryConsumption;

      newCharge -= totalBatteryConsumption;

      history.addEvent('drone-battery-update', {
        newCharge,
        droneId: drone.id,
        oldCharge: currentCharge
      })

      if (newCharge <= 0) {
        console.error(`Drone ${drone.id} ran out of battery!`)
      }
    }

    data.drones[drone.id].battery.currentCharge = newCharge;

  }
})

export const memoryDbCustomer = (data: SimulationData) => ({
  add(c: Customer) {
    data.customers.push(c)
    return c
  }
})

export const memoryDbWarehouse = (data: SimulationData) => ({
  getWithId(id: number, arr = data.warehouses) {
    return arr[id];
  },
  getNearest(position: Position, arr = data.warehouses) {
    return arr.map((warehouse, id) => ({
      warehouse,
      id,
      distance: distanceBetween(warehouse.position, position)
    })).reduce((acc, curr) => {
      if (acc.distance < curr.distance) return acc;
      return curr;
    })
  },
  add(w: InputWarehouse) {
    const warehouse: Warehouse = {
      name: w.name,
      droneIds: [],
      position: { x: w.x, y: w.y },
      id: data.warehouses.length
    }
    
    data.warehouses.push(warehouse)
    return warehouse
  }
})

// each "adapter" split into it's own function so can be used standalone, which makes it easier to treeshake and test
export const memoryDb = (data: SimulationData) => ({
  history: memoryDbHistory(data),
  order: memoryDbOrder(data),
  drone: memoryDbDrone(data),
  warehouse: memoryDbWarehouse(data),
  customer: memoryDbCustomer(data)
})
