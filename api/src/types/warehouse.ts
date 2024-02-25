import { t } from "elysia"
import type { Static } from '@sinclair/typebox';

import { Position } from "./position";

export const Warehouse = t.Object({
  id: t.Number({ minimum: 0 }),
  name: t.String({ minLength: 1 }),
  position: Position,
  droneIds: t.Array(t.Number({ minimum: 0 })),
})

export const InputWarehouse = t.Intersect([Position, t.Object({ name: t.String({ minLength: 1 }) })])

export type InputWarehouse = Static<typeof InputWarehouse>
export type Warehouse = Static<typeof Warehouse>
