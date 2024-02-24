import { t } from "elysia"
import type { Static } from '@sinclair/typebox';

import { ChargingStation } from "./charging-station";
import { Customer } from "./customer";
import type { Drone } from "./drone";
import type { Order } from "./order";
import type { ProductMap } from "./product";
import type { Warehouse } from "./warehouse";
import { DroneBattery } from "./drone-battery";
import { History } from "./history";

export const SimulationDeliveryStatus = t.Object({
  output: t.Boolean(),
  frequency: t.Number(),
})

export const SimulationOutput = t.Object({
  poweredOn: t.Boolean(),
  minutes: t.Object({
    program: t.Number({ minimum: 0 }),
    real: t.Number({ minimum: 0 })
  })
})

export type SimulationDeliveryStatus = Static<typeof SimulationDeliveryStatus>
export type SimulationOutput = Static<typeof SimulationOutput>

export type SimulationData = {
  warehouses: Warehouse[],
  drones: Drone[],
  orders: Order[],
  products: ProductMap,
  // typesOfDrones: DroneType[],
  batteries: DroneBattery[],
  customers: Customer[],
  chargingStations: ChargingStation[],
  deliveryStatus: SimulationDeliveryStatus,
  timeFactorMs: number,
  history: History,
  analytics: {
    openOrders: number,
    droneCount: number,

    totalOrdersDelivered: number,
    totalDistance: number,

    averageDistancePerOrder: number,
    averageDistancePerDrone: number,
  }
}
