import type { Drone } from "./drone"
import type { Order } from "./order"
import type { Warehouse } from "./warehouse"

export type HistoryEvents = 'initialized' | 'drone-created' | 'drone-sent' | 'order-fulfilled'

export interface HistoryEventPayloads {
  initialized: {},
  'drone-created': {
    droneId: number
  },
  'drone-sent': {
    droneId: number,
    order: Order,
    warehouseId: number
    distance: number;
  },
  'order-fulfilled': {
    order: Order,
    droneId: number
  }
}

type a = HistoryEventPayloads['drone-sent']

export interface HistoryEvent<Event extends HistoryEvents> {
  event: Event,
  payload: HistoryEventPayloads[Event],
  createdAt: number
}

export function createHistoryEvent<Event extends HistoryEvents>(event: Event, payload: HistoryEventPayloads[Event], ts = Date.now()): HistoryEvent<Event> {
  return {
    event,
    payload,
    createdAt: ts
  }
}

export type History = {
  data: HistoryEvent<HistoryEvents>[],
  _meta: {
    lastFetched: number
  }
}
