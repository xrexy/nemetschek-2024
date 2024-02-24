import { t } from "elysia"
import { Static } from '@sinclair/typebox';

import { Position } from "./position";

export const ChargingStationType = t.Union([t.Literal('cheapest'), t.Literal('normal'), t.Literal('fast')])

export const InputChargingStation = t.Intersect([Position, t.Object({ type: ChargingStationType })])

export type InputChargingStation = Static<typeof InputChargingStation>
export type ChargingStationType = Static<typeof ChargingStationType>
export type ChargingStation = { type: ChargingStationType, droneIds: number[], position: Position } 
