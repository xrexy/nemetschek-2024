import { distanceBetween } from "./distance";

import { Drone, DroneStatus, DroneStatusData } from "../types/drone";
import { HistoryEventPayloads, HistoryEvents, createHistoryEvent } from "../types/history";
import { Order } from "../types/order";
import { Position } from "../types/position";
import { SimulationData } from "../types/simulation";
import { Warehouse } from "../types/warehouse";

export const WAREHOUSE_TIME_FOR_FULL_CHARGE = 20;
export const RESUPPLY_DELAY = 20;

export function findCheapestBattery(batteries: SimulationData['batteries'], distance: number, weight: number) {
  return batteries.reduce((acc, curr) => {
    const cost = curr.consumption * distance * weight;
    if (acc.battery.capacity < cost) return acc;
    return { cost, battery: curr }
  }, { cost: Infinity, battery: batteries[0] })
}

export function createDrone(o: {
  distance: number,
  packageWeight: number,
  data: SimulationData,
  droneData: {
    status: DroneStatus,
    statusData: Partial<DroneStatusData>,
  }
}): Drone {
  console.error('CREATING DRONE')
  const { data, droneData, distance, packageWeight } = o;

  const id = data.drones.length;
  const { battery } = findCheapestBattery(data.batteries, distance, packageWeight);

  data.history.data.push(createHistoryEvent('drone-created', { droneId: id }))

  console.debug('dc', data.analytics.droneCount)
  data.analytics.droneCount++;
  console.debug('dc1', data.analytics.droneCount)

  return {
    battery,
    id,
    ...droneData
  }
}

// -- Cleaned up(i hope) impl
function helperAdapter(data: SimulationData) {
  const history = {
    addEvent: <Event extends HistoryEvents>(event: Event, payload: HistoryEventPayloads[Event], ts?: number) => {
      data.history.data.push(createHistoryEvent(event, payload, ts));
    }
  }
  return {
    order: {
      getWithStatus: (status: Order['status'], arr = data.orders) => {
        return arr.filter(order => order.status === status);
      },

      getWithId: (id: number, arr = data.orders) => {
        return arr[id]
      }
    },
    drone: {
      getWithStatus: (status: Drone['status'], arr = data.drones) => {
        return arr.filter(drone => drone.status === status);
      },

      getWithId: (id: number, arr = data.drones) => {
        return arr[id];
      },

      sendToOrder: (drone: Drone, droneWarehouse: Warehouse, order: Order, distance: number, ts = Date.now()) => {
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
          order,
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

      updateBatteryCharge: (drone: Drone, programDiff: number) => {
        const currentCharge = drone.battery.currentCharge;
        const maxCharge = drone.battery.capacity;

        if (currentCharge === maxCharge) return drone;

        const chargeRate = maxCharge / WAREHOUSE_TIME_FOR_FULL_CHARGE;
        const newCharge = currentCharge + chargeRate * programDiff;

        // math.min to prevent overcharging
        drone.battery.currentCharge = Math.min(maxCharge, newCharge);

        data.drones[drone.id] = drone;
      }
    },
    warehouse: {
      getWithId: (id: number, arr = data.warehouses) => {
        return arr[id];
      },
      getNearest: (position: Position, arr = data.warehouses) => {
        return arr.map((warehouse, id) => ({
          warehouse,
          id,
          distance: distanceBetween(warehouse.position, position)
        })).reduce((acc, curr) => {
          if (acc.distance < curr.distance) return acc;
          return curr;
        })
      }
    },
    history,
  }
}

export function updateDroneBatteryCharge(drone: Drone, programDiff: number) {
  const currentCharge = drone.battery.currentCharge;
  const maxCharge = drone.battery.capacity;

  if (currentCharge === maxCharge) return drone;

  const chargeRate = maxCharge / WAREHOUSE_TIME_FOR_FULL_CHARGE;
  const newCharge = currentCharge + chargeRate * programDiff;

  // math.min to prevent overcharging
  drone.battery.currentCharge = Math.min(maxCharge, newCharge);

  return drone;
}

export function simulationTick(data: SimulationData): SimulationData {
  const now = Date.now();
  const diff = now - data.history._meta.lastFetched;
  const programDiff = diff / data.timeFactorMs;

  const helpers = helperAdapter(data);

  console.log('orders', data.orders.length)

  // update returning drones(they are returning to the warehouse after delivering the order)
  for (let drone of helpers.drone.getWithStatus('returning')) {
    const { goingTo, startedAt, order, distance, distanceCovered } = drone.statusData.returning!;
    const timeElapsed = now - startedAt;

    const distanceCoveredThisTick = timeElapsed / data.timeFactorMs;
    const newDistanceCovered = distanceCovered + distanceCoveredThisTick;

    if (newDistanceCovered >= distance) {
      const warehouse = helpers.warehouse.getWithId(goingTo.warehouseId);
      warehouse.droneIds.push(drone.id);

      drone.status = 'idle';
      drone.statusData = {
        idle: {
          warehouseId: goingTo.warehouseId,
          arrivedAt: now
        }
      }

      helpers.history.addEvent('drone-returned', {
        droneId: drone.id,
        warehouseId: warehouse.id
      })

      continue;
    }

    drone.statusData.returning!.distanceCovered = newDistanceCovered;
    updateDroneBatteryCharge(drone, programDiff);
  };

  // update delivering drones
  for (let drone of helpers.drone.getWithStatus('delivering')) {
    const { distance, distanceCovered, startedAt, orderId } = drone.statusData.delivering!;
    const timeElapsed = now - startedAt;

    const distanceCoveredThisTick = timeElapsed / data.timeFactorMs;

    console.log('delivering distanceCoveredThisTick', distanceCoveredThisTick)
    const newDistanceCovered = distanceCovered + distanceCoveredThisTick;

    if (newDistanceCovered >= distance) {
      const order = helpers.order.getWithId(orderId);
      const { warehouse, distance } = helpers.warehouse.getNearest(order.customer.coordinates)

      drone.status = 'returning';
      drone.statusData = {
        returning: {
          goingTo: {
            warehouseId: warehouse.id
          },
          startedAt: now,
          distance,
          distanceCovered: 0,
          order
        }
      };

      // filter out the order
      data.orders = data.orders.filter(o => o.id !== orderId);

      helpers.history.addEvent('order-fulfilled', {
        order,
        droneId: drone.id,
      })


      data.analytics.openOrders = data.orders.length;

      data.analytics.totalOrdersDelivered++;
      data.analytics.totalDistance += distance;

      data.analytics.averageDistancePerOrder = data.analytics.totalDistance / data.analytics.totalOrdersDelivered;
      data.analytics.averageDistancePerDrone = data.analytics.totalDistance / data.drones.length;

      continue;
    }

    drone.statusData.delivering!.distanceCovered = newDistanceCovered;
    // TODO: currently not updating battery
    updateDroneBatteryCharge(drone, programDiff);
  }

  // check for pending orders 

  for (let order of helpers.order.getWithStatus('pending')) {
    const { warehouse, distance } = helpers.warehouse.getNearest(order.customer.coordinates)

    // if there are no drones, create one and send it to the order
    if (data.drones.length === 0) {
      const drone = createDrone({
        distance,
        data,
        packageWeight: order.weight,
        droneData: {
          status: 'delivering',
          statusData: {
            delivering: {
              distance,
              orderId: order.id,
              startedAt: now,
              distanceCovered: 0,
            }
          }
        }
      })

      helpers.drone.sendToOrder(drone, warehouse, order, distance, now);

      data.drones.push(drone);

      continue;
    }

    // if there are drones, check if any of them are available
    const dronesInWarehouse = warehouse.droneIds.map(id => updateDroneBatteryCharge(helpers.drone.getWithId(id), programDiff));
    const availableDrone = dronesInWarehouse.find(drone => drone.status === 'idle' && drone.battery.currentCharge > distance * 2);

    if (availableDrone) {
      console.debug('found available drone', availableDrone.id)
      helpers.drone.sendToOrder(availableDrone, warehouse, order, distance, now);
      continue
    }

    // if there are no available drones, check if any of them are returning
    const returningDrone = dronesInWarehouse.find(drone => drone.status === 'returning' && drone.battery.currentCharge > distance * 2);
    if (returningDrone) {
      const { startedAt, order, distance, distanceCovered } = returningDrone.statusData.returning!;
      const timeUntilReturn = (distance - distanceCovered) * data.timeFactorMs;
      const timeElapsed = now - startedAt;

      console.debug('timeUntilReturn', timeUntilReturn)
      console.debug('timeElapsed', timeElapsed + RESUPPLY_DELAY)
      if (timeUntilReturn < timeElapsed + RESUPPLY_DELAY) {
        console.debug('found returning drone', returningDrone.id)
        helpers.drone.sendToOrder(returningDrone, warehouse, order, distance, now);
        continue;
      }
    }

    // if there are no returning drones, create a new one
    const drone = createDrone({
      distance,
      data,
      packageWeight: order.weight,
      droneData: {
        status: 'delivering',
        statusData: {
          delivering: {
            distance,
            orderId: order.id,
            startedAt: now,
            distanceCovered: 0,
          }
        }
      }
    })

    helpers.drone.sendToOrder(drone, warehouse, order, distance, now);

    data.drones.push(drone);
  }
  data.history._meta.lastFetched = now;

  return data;
}

