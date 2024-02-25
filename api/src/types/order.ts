import type { Static } from '@sinclair/typebox';
import { t } from "elysia";

import { Customer } from "./customer";

export const ProductList = t.Record(t.String(), t.Number({ minimum: 1 }))

export const OrderStatus = t.Union([
  t.Literal('pending'),
  t.Literal('assigned'),
])

export const OrderStatusData = t.Object({
  pending: t.Object({}),
  assigned: t.Object({
    droneId: t.Number({ minimum: 0 }),
    startedAt: t.Number({ minimum: 0 })
  })
})

export const Order = t.Object({
  id: t.Number({ minimum: 0 }),
  customer: Customer,
  productList: ProductList,
  status: OrderStatus,
  weight: t.Number({ minimum: 0 }),
  statusData: t.Partial(OrderStatusData)
})

export const InputOrder = t.Object({
  customerId: t.Number({ minimum: 0 }),
  productList: ProductList
})

export type ProductList = Static<typeof ProductList>

export type Order = Static<typeof Order>
export type InputOrder = Static<typeof InputOrder>
export type OrderStatus = Static<typeof OrderStatus>
export type OrderStatusData = Static<typeof OrderStatusData>

