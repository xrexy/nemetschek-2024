import { t } from "elysia"
import { Static } from '@sinclair/typebox';

import { Position } from "./position";

export const Customer = t.Object({
  id: t.Number(),
  name: t.String(),
  coordinates: Position
})

export type Customer = Static<typeof Customer>
