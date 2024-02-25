import { Static } from '@sinclair/typebox';
import { t } from "elysia";

import { DroneBattery, DroneBatteryType } from "./drone-battery";
import { Order } from "./order";
import { Position } from "./position";

export const DroneStatus = t.Union([
  t.Literal('pre-deployment'),
  t.Literal('charging'),
  t.Literal('idle'),
  t.Literal('resupplying'),
  t.Literal("delivering"),
  t.Literal('returning')
])

export const DroneStatusData = t.Object({
  charging: t.Object({
    position: Position,
    startedAt: t.Number()
  }),
  idle: t.Object({
    warehouseId: t.Number(),
    arrivedAt: t.Number()
  }),
  resupplying: t.Object({
    warehouseIdx: t.Number(),
    startedAt: t.Number(),
    order: Order
  }),
  delivering: t.Object({
    orderId: t.Number({ minimum: 0 }),
    startedAt: t.Number(),
    distance: t.Number(),
    distanceCovered: t.Number()
  }),
  'pre-deployment': t.Object({
    orderId: t.Number({ minimum: 0 }),
    distance: t.Number(),
    originWarehouseId: t.Number({ minimum: 0 }),
    startedAt: t.Number()
  }),
  returning: t.Object({
    order: Order,
    goingTo: t.Object({
      warehouseId: t.Number()
    }),
    distance: t.Number(),
    distanceCovered: t.Number(),
    startedAt: t.Number()
  })
})

export const Drone = t.Object({
  id: t.Number({ minimum: 0 }),
  battery: DroneBattery,
  status: DroneStatus,
  statusData: t.Partial(DroneStatusData)
})

export const InputDroneType = t.Object({
  capacity: t.String({}),
  consumption: t.String(),
  type: DroneBatteryType
})


export type InputDroneType = Static<typeof InputDroneType>

export type Drone = Static<typeof Drone>
export type DroneStatus = Static<typeof DroneStatus>
export type DroneStatusData = Static<typeof DroneStatusData>

