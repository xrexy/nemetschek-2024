import { Elysia } from "elysia";
import { ctx } from "../context";
import { SimulationData } from "../types/simulation";
import { calculateSimulationTickSpeed } from "../utils/simulation";

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
        ws.send(`No data found for slug ${slug}`);
        ws.close();
        return;
      }

      // bun's ws pub/sub impl not currently working properly in elysia, so we'll handle intervals manually
      store.intervalStorage[slug] = setInterval(() => ws.send(getData(slug)), calculateSimulationTickSpeed(data))
    }
  })
