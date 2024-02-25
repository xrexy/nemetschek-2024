export type SimulationTemplate = {
  slug: string,
  initialOrders: number,
  warehouses: number,

  products: number,
  customers: number
}

export const simulationTemplates = Object.freeze([
  {
    slug: 'lecture-example',
    initialOrders: 6,
    warehouses: 2,
    products: 10,
    customers: 3,
  } as const,
  {
    slug: 'single-warehouse',
    initialOrders: 5,
    warehouses: 1,
    products: 8,
    customers: 3,

  } as const,
  {
    slug: 'without-initial-orders',
    initialOrders: 0,
    warehouses: 2,
    products: 8,
    customers: 2,
  } as const
] satisfies SimulationTemplate[])
