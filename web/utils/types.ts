export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

export type Position = { x: number; y: number; }

export type Customer = {
  id: number;
  name: string;
  coordinates: Position;
}

export type OrderStatus = "pending" | "assigned"
export type OrderStatusData = {
  pending: {};
  assigned: {
    droneId: number;
    startedAt: number;
  }
}

export type Order = {
  id: number;
  customer: Customer;
  productList: Record<string, number>;
  status: OrderStatus;
  weight: number;
  statusData?: OrderStatusData;
}

export const droneBatteryTypes = ["normal", "fast-charged"] as const;
export type DroneBatteryType = typeof droneBatteryTypes[number];
export type DroneBattery = {
  type: DroneBatteryType;
  capacity: number;
  consumption: number;
  currentCharge: number;
}

export type DroneStatus = "pre-deployment" | "charging" | "idle" | "resupplying" | "delivering" | "returning"
export type DroneStatusData = {
  charging?: {
    position: Position;
    startedAt: number;
  };
  idle?: {
    warehouseId: number;
    arrivedAt: number;
  };
  resupplying?: {
    warehouseIdx: number;
    startedAt: number;
    order: Order;
  };
  delivering?: {
    orderId: number;
    startedAt: number;
    distance: number;
    distanceCovered: number;
  };
  "pre-deployment"?: {
    orderId: number;
    distance: number;
    originWarehouseId: number;
    startedAt: number;
  };
  returning?: {
    order: Order;
    goingTo: {
      warehouseId: number;
    };
    distance: number;
    distanceCovered: number;
    startedAt: number;
  };
}

export function getStatusData<T extends DroneStatus>(
  drone: Drone,
  status: T
): DroneStatusData[T] | undefined {
  if (drone.status === status && drone.statusData !== undefined) {
    return drone.statusData[status];
  }
  return undefined;
}

export type Drone = {
  id: number;
  battery: DroneBattery;
  status: DroneStatus;
  statusData?: DroneStatusData;
}

export type ChargingStationType = "normal" | "cheapest" | "fast"
export type ChargingStation = {
  type: ChargingStationType;
  droneIds: number[];
  position: Position;
}

export type Warehouse = {
  name: string;
  id: number;
  position: Position;
  droneIds: number[];
}

export type HistoryEvents = 'created' | 'drone-created' | 'drone-battery-update' | 'drone-returned' | 'drone-sent' | 'order-fulfilled' | 'order-added'
export type MinimalOrder = { customerId: number } & Pick<Order, 'productList' | 'id'>
export type InputOrder = Omit<MinimalOrder, 'id'>
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

  'order-added': {
    order: MinimalOrder
  }
}

export interface HistoryEntry<Event extends HistoryEvents> {
  event: Event,
  payload: HistoryEventPayloads[Event],
  createdAt: number
}

export type History = {
  data: HistoryEntry<HistoryEvents>[],
  _meta: {
    lastFetched: number
  }
}

export function isHistoryEvent<T extends HistoryEvents>(event: HistoryEntry<HistoryEvents>, eventType: T): event is HistoryEntry<T> {
  return event.event === eventType;
}

export type Simulation = {
  warehouses: Warehouse[];
  drones: Drone[];
  orders: Order[];
  products: Record<string, number>;
  batteries: DroneBattery[];
  customers: Customer[];
  chargingStations: ChargingStation[];
  deliveryStatus: {
    output: boolean;
    frequency: number;
  };
  timeFactorMs: number;
  history: History;
  slug: string;
  analytics: {
    openOrders: number;
    droneCount: number;
    hasOpenOrders: boolean;
    totalOrdersDelivered: number;
    totalDistanceCovered: number;
    averageDistancePerOrder: number;
    averageDistancePerDrone: number;
  };
}

export type ProductList = Record<string, number>

export type SimulationInput = {
  deliveryStatus: Simulation['deliveryStatus']
  output: {
    poweredOn: boolean,
    minutes: {
      program: number,
      real: number
    }
  },
  'map-top-right-coordinate': Position,
  products: ProductList,
  warehouses: (Position & { name: string })[]
  customers: {
    coordinates: Position,
    id: string,
    name: string;
  }[],
  orders: {
    customerId: string,
    productList: ProductList
  }[],
  typesOfDrones: {
    capacity: string,
    consumption: string,
    type: DroneBatteryType
  }[],

  chargingStations: (Position & { type: ChargingStationType })[],
}

export type MinimalSimulation = Pick<Simulation, 'analytics' | 'drones' | 'slug' | 'timeFactorMs' | 'warehouses' | 'customers'>

