import { distanceBetween } from "./distance";

import { Drone, DroneStatus, DroneStatusData } from "../types/drone";
import { HistoryEventPayloads, HistoryEvents, createHistoryEvent } from "../types/history";

import { InputOrder, Order } from "../types/order";
import { Position } from "../types/position";
import { SimulationData } from "../types/simulation";
import { Warehouse } from "../types/warehouse";
import { memoryDbHistory, memoryDb } from "./db";
import { Customer } from "../types/customer";

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
  const { data, droneData, distance, packageWeight } = o;

  const id = data.drones.length;
  const { battery } = findCheapestBattery(data.batteries, distance, packageWeight);

  memoryDbHistory(data).addEvent('drone-created', { droneId: id })

  const drone = {
    battery: { ...battery },
    id,
    ...droneData
  }

  data.drones.push(drone);
  data.analytics.droneCount = data.drones.length;

  return drone
}

export function calculateSimulationTime(data: SimulationData) {
  const now = Date.now();
  const diff = now - data.history._meta.lastFetched;
  const programDiff = diff / data.timeFactorMs;

  return { now, diff, programDiff }
}

export function calculateSimulationTickSpeed(data: SimulationData) {
  return data.deliveryStatus.frequency * data.timeFactorMs;
}

export function findCustomer(data: SimulationData, customerId: number): Customer {
  return data.customers.find(c => c.id === customerId)!
}

export function parseInputOrder(data: SimulationData, o: InputOrder, id?: number): Order {
  const customer = findCustomer(data, o.customerId);
  if (!customer) throw new Error(`customer not found for id ${o.customerId}`)

  return {
    id: id || data.orders.length,
    customer: findCustomer(data, o.customerId),
    productList: o.productList,
    status: 'pending',
    statusData: { pending: {} },
    weight: Object.values(o.productList).reduce((acc, curr) => acc + curr, 0)
  }
}

export function simulationTick(data: SimulationData, time?: {
  now: number,
  diff: number,
  programDiff: number,
}): SimulationData {
  const { now, programDiff } = time ?? calculateSimulationTime(data);
  const db = memoryDb(data);

  for (let drone of db.drone.getWithStatus('idle')) {
    db.drone.updateBatteryCharge(db, drone, programDiff);
  }

  // update returning drones(they are returning to the warehouse after delivering the order)
  for (let drone of db.drone.getWithStatus('returning')) {
    const { goingTo, startedAt, order, distance, distanceCovered } = drone.statusData.returning!;
    const timeElapsed = now - startedAt;

    const distanceCoveredThisTick = timeElapsed / data.timeFactorMs;
    const newDistanceCovered = distanceCovered + distanceCoveredThisTick;

    if (newDistanceCovered >= distance) {
      const warehouse = db.warehouse.getWithId(goingTo.warehouseId);
      warehouse.droneIds.push(drone.id);

      drone.status = 'idle';
      drone.statusData = {
        idle: {
          warehouseId: goingTo.warehouseId,
          arrivedAt: now
        }
      }

      db.history.addEvent('drone-returned', {
        droneId: drone.id,
        warehouseId: warehouse.id
      })

      continue;
    }

    drone.statusData.returning!.distanceCovered = newDistanceCovered;
    db.drone.updateBatteryCharge(db, drone, programDiff);
  };

  // update delivering drones
  for (let drone of db.drone.getWithStatus('delivering')) {
    const { distance, distanceCovered, startedAt, orderId } = drone.statusData.delivering!;
    const timeElapsed = now - startedAt;

    const distanceCoveredThisTick = timeElapsed / data.timeFactorMs;

    const newDistanceCovered = distanceCovered + distanceCoveredThisTick;

    if (newDistanceCovered >= distance) {
      const order = db.order.getWithId(orderId);
      if (!order) {
        console.error(`tried accessing null order ${orderId}`)
        continue;
      }
      const { warehouse, distance } = db.warehouse.getNearest(order.customer.coordinates)

      order.status = 'delivered'
      order.statusData = {
        delivered: {
          droneId: drone.id,
          startedAt: drone.statusData.delivering!.startedAt,
          distance: drone.statusData.delivering!.distance
        }
      }

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

      db.history.addEvent('order-fulfilled', {
        order: {
          id: order.id,
          customerId: order.customer.id,
          productList: order.productList
        },
        droneId: drone.id,
      })

      const openOrders = db.order.getWithStatus('pending').length;
      data.analytics.openOrders = openOrders;
      data.analytics.hasOpenOrders = openOrders > 0;

      data.analytics.totalOrdersDelivered++;
      data.analytics.totalDistanceCovered += distance;

      const totalDistance = data.analytics.totalDistanceCovered;
      data.analytics.averageDistancePerOrder = totalDistance / data.analytics.totalOrdersDelivered;
      data.analytics.averageDistancePerDrone = totalDistance / data.drones.length;

      continue;
    }

    drone.statusData.delivering!.distanceCovered = newDistanceCovered;
    db.drone.updateBatteryCharge(db, drone, programDiff);
  }

  for (let order of db.order.getWithStatus('pending')) {
    const { warehouse, distance } = db.warehouse.getNearest(order.customer.coordinates)

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

      db.drone.sendToOrder(db.history, drone, warehouse, order, distance, now);

      continue;
    }

    // if there are drones, check if any of them are available
    const dronesInWarehouse = warehouse.droneIds.map((id) => db.drone.getWithId(id));

    const availableDrone = dronesInWarehouse.find(drone => drone.status === 'idle' && drone.battery.currentCharge > distance * 2);

    if (availableDrone) {
      console.debug('found available drone', availableDrone.id)
      db.drone.sendToOrder(db.history, availableDrone, warehouse, order, distance, now);
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
        db.drone.sendToOrder(db.history, returningDrone, warehouse, order, distance, now);
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

    db.drone.sendToOrder(db.history, drone, warehouse, order, distance, now);
  }

  return data;
}

