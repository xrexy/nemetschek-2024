import { Elysia, t } from "elysia";
import { ctx } from "../context";
import { calculateSimulationTickSpeed, parseInputOrder } from "../utils/simulation";
import { InputOrder, ProductList } from "../types/order";
import { memoryDb, memoryDbHistory, memoryDbWarehouse } from "../utils/db";
import { Position } from "../types/position";
import { assetNever } from "../types/utility";
import { InputWarehouse } from "../types/warehouse";
import { Customer } from "../types/customer";

export const ws = new Elysia({
  prefix: "/ws",
  name: "ws:root",
})
  .use(ctx)
  .ws('/:slug', {
    close(ws, code, message) {
      ws.data.log.debug(`${code} WS closed: ${message || 'no message'}`);
      clearInterval(ws.data.store.intervalStorage[ws.data.params.slug])
    },
    open(ws) {
      const slug = ws.data.params.slug;
      const { store } = ws.data;

      function getData(s: string) {
        return store.data[s];
      }

      const data = getData(slug);
      if (!data) {
        ws.send({ ok: false, message: `No data found for slug ${slug}` });
        ws.close();
        return;
      }

      // bun's ws pub/sub impl not currently working properly in elysia, so we'll handle intervals manually
      store.intervalStorage[slug] = setInterval(() => ws.send(getData(slug)), calculateSimulationTickSpeed(data))
    },
    message(ws, message) {
      const slug = ws.data.params.slug;
      const data = ws.data.store.data[slug]
      if (!data) {
        ws.send({ ok: false, message: `No data found for slug ${slug}`, event: message.event });
        // ws.close();
        return;
      }

      const db = memoryDb(data);
      if (message.event === 'add-order') {
        try {
          const { payload } = message;

          let order = parseInputOrder(data, payload);
          data.orders.push(order);

          ws.data.store.data[slug] = data;

          db.history.addEvent('order-added', {
            order: {
              customerId: order.customer.id,
              id: order.id,
              productList: order.productList
            }
          })

          ws.send({ ok: true, message: "Order added", event: message.event });
        } catch (e) {
          console.error(e)
          ws.send({ ok: false, message: "Invalid customer id", event: message.event });
        }

        return;
      }

      if (message.event === 'add-warehouse') {
        const { payload } = message;
        const addedWarehouse = db.warehouse.add(payload)

        db.history.addEvent("warehouse-added", {
          warehouse: {
            id: addedWarehouse.id,
            position: addedWarehouse.position
          }
        })

        ws.send({ ok: true, message: "Warehouse added", event: message.event });
        return;
      }

      if (message.event === 'add-customer') {
        const { payload } = message;

        db.customer.add(payload)
        db.history.addEvent('customer-added', {
          customer: {
            name: payload.name,
            id: payload.id
          }
        })

        ws.send({ ok: true, message: "Customer added", event: message.event });
        return;
      }

      if (message.event === 'add-product') {
        const { payload } = message;

        data.products = {
          ...data.products,
          [payload.name]: payload.weight
        }

        db.history.addEvent('product-added', {
          product: { ...payload }
        })

        ws.send({ ok: true, message: "Product added", event: message.event });
        return;
      }

      assetNever(message)
    },
    body: t.Union([
      t.Object({
        event: t.Literal('add-order'),
        payload: InputOrder
      }),
      t.Object({
        event: t.Literal('add-warehouse'),
        payload: InputWarehouse
      }),
      t.Object({
        event: t.Literal('add-customer'),
        payload: Customer,
      }),
      t.Object({
        event: t.Literal('add-product'),
        payload: t.Object({
          name: t.String(),
          weight: t.Number({ min: 1 }),
        })
      })
    ])
  })
