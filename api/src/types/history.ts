import type { Drone } from "./drone"
import type { Order } from "./order"
import type { Warehouse } from "./warehouse"

export type HistoryEvents = 'created' | 'drone-created' | 'drone-battery-update' | 'drone-returned' | 'drone-sent' | 'order-fulfilled'
type MinimalOrder = { customerId: number } & Pick<Order, 'productList' | 'id'>

export interface HistoryEventPayloads {
  created: {},

  'drone-created': {
    droneId: number
  },

  'drone-returned': {
    droneId: number,
    warehouseId: number
  },

  'drone-battery-update': {
    droneId: number,
    newCharge: number,
    oldCharge: number
  }

  'drone-sent': {
    droneId: number,
    order: MinimalOrder,
    warehouseId: number
    distance: number;
  },

  'order-fulfilled': {
    order: MinimalOrder,
    droneId: number
  }
}

export interface HistoryEntry<Event extends HistoryEvents> {
  event: Event,
  payload: HistoryEventPayloads[Event],
  createdAt: number
}

export function createHistoryEvent<Event extends HistoryEvents>(event: Event, payload: HistoryEventPayloads[Event], ts = Date.now()): HistoryEntry<Event> {
  return {
    event,
    payload,
    createdAt: ts
  }
}

export type History = {
  data: HistoryEntry<HistoryEvents>[],
  _meta: {
    lastFetched: number
  }
}
