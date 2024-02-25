import { Elysia, t } from "elysia";
import { ctx } from "../context";
import { calculateSimulationTickSpeed, parseInputOrder } from "../utils/simulation";
import { InputOrder } from "../types/order";
import { memoryDbHistory } from "../utils/db";

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
      if (message.event === 'add-order') {
        const { payload } = message;
        const slug = ws.data.params.slug;
        const data = ws.data.store.data[slug]
        if (!data) {
          ws.send({ ok: false, message: `No data found for slug ${slug}`, event: message.event });
          // ws.close();
          return;
        }

        try {
          const historyDb = memoryDbHistory(data);
          let order = parseInputOrder(data, payload);
          data.orders.push(order);

          ws.data.store.data[slug] = data;

          historyDb.addEvent('order-added', {
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
      }
    },
    body: t.Object({
      event: t.Literal('add-order'),
      payload: InputOrder
    })
  })
