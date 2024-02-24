import { t } from "elysia"
import type { Static } from '@sinclair/typebox';

export const DroneBatteryType = t.Union([t.Literal('normal'), t.Literal('fast-charged')])

export const DroneBattery = t.Object({
  type: DroneBatteryType,
  capacity: t.Number({ minimum: 0 }),
  consumption: t.Number({ minimum: 0 }),
  currentCharge: t.Number({ minimum: 0 }),
})

export type DroneBatteryType = Static<typeof DroneBatteryType>
export type DroneBattery = Static<typeof DroneBattery>
