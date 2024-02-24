import { t } from "elysia"
import type { Static } from '@sinclair/typebox';

export const Position = t.Object({
  x: t.Number({ minimum: 0 }),
  y: t.Number({ minimum: 0 })
})

export type Position = Static<typeof Position>
