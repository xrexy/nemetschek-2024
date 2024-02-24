import { t } from "elysia"
import type { Static } from '@sinclair/typebox';

export const ProductMap = t.Record(t.String(), t.Number({ minimum: 1 }))

export type ProductMap = Static<typeof ProductMap>
