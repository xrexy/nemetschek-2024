import { Elysia, t } from "elysia";
import { ctx } from "../context";

import { generateSlug } from 'random-word-slugs';

import { InputChargingStation } from "../types/charging-station";
import { Customer } from "../types/customer";
import { InputDroneType } from "../types/drone";
import { InputOrder, Order } from "../types/order";
import { Position } from "../types/position";
import { ProductMap } from "../types/product";
import { SimulationData, SimulationDeliveryStatus, SimulationOutput } from "../types/simulation";
import { InputWarehouse, Warehouse } from "../types/warehouse";
import { DroneBattery } from "../types/drone-battery";

export const simulationController = new Elysia({
  prefix: "/simulation",
  name: "api:simulation",
})
  .use(ctx)
  .get('/online', ctx => {
    return { data: Object.entries(ctx.store.data) }
  })
  .post('/new', ctx => {
    const slug = generateSlug(3)
    const { body } = ctx;

    function findCustomer(order: InputOrder) {
      const customer = body.customers.find(c => c.id === order.customerId);
      if (!customer) throw new Error('Invalid customer passed in')
      return customer;
    }

    function parseToBattery(d: InputDroneType): DroneBattery {
      function parse(s: string): number {
        let n = parseInt(s);
        if (isNaN(n)) throw new Error('Invalid number')
        if (s.toLowerCase().endsWith('kw')) n *= 1000;
        return n;
      }

      const capacity = parse(d.capacity);
      return { capacity, currentCharge: capacity, consumption: parse(d.consumption), type: d.type }
    }

    const data: SimulationData = {
      slug,
      drones: [],
      history: {
        data: [],
        _meta: { lastFetched: Date.now() }
      },

      analytics: {
        openOrders: body.orders.length,
        hasOpenOrders: body.orders.length > 0,

        droneCount: 0,
        totalOrdersDelivered: 0,
        averageDistancePerDrone: 0,
        averageDistancePerOrder: 0,
        totalDistanceCovered: 0,
      },

      batteries: body.typesOfDrones.map(parseToBattery),
      chargingStations: body.chargingStations.map((cs) => ({ type: cs.type, position: { x: cs.x, y: cs.y }, droneIds: [] })),
      products: body.products,
      customers: body.customers,

      timeFactorMs: body.output.poweredOn ? (1 / body.output.minutes.program) * body.output.minutes.real : 1000,
      deliveryStatus: body.deliveryStatus,

      warehouses: body.warehouses.map((wh, k) => ({
        droneIds: [],
        position: { x: wh.x, y: wh.y },
        name: wh.name,
        id: k,
      } satisfies Warehouse)),

      orders: body.orders.map((order, k) => ({
        id: k,
        customer: findCustomer(order),
        productList: order.productList,
        status: 'pending',
        statusData: { pending: {} },
        weight: Object.values(order.productList).reduce((acc, curr) => acc + curr, 0)
      } satisfies Order))
    }

    ctx.store.data[slug] = data;

    return { status: "Created new simulation. Use /api/v1/simulation/online to see all online simulations.", slug }
  }, {
    body: t.Object({
      deliveryStatus: SimulationDeliveryStatus,
      products: ProductMap,
      output: SimulationOutput,
      'map-top-right-coordinate': Position,
      warehouses: t.Array(InputWarehouse),
      customers: t.Array(Customer),
      orders: t.Array(InputOrder),
      typesOfDrones: t.Array(InputDroneType),
      chargingStations: t.Array(InputChargingStation)
    })
  })
