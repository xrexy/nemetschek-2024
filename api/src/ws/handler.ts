import { Elysia, t } from "elysia";
import { ctx } from "../context";
import { simulationTick } from "../utils/simulation";
import { SimulationData } from "../types/simulation";

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

      const getTickSpeed = (data: SimulationData) => data.deliveryStatus.frequency * data.timeFactorMs
      function getData(s: string) {
        let data = store.data[s];
        if (!data) return;

        const now = Date.now();
        const diff = now - data.history._meta.lastFetched;
        const programDiff = diff / data.timeFactorMs;

        const tickSpeed = getTickSpeed(data);
        const missedTicks = Math.floor(diff / tickSpeed);

        if (missedTicks > 1) {
          // TODO: handle missed ticks, not sure what to with them yet
          // everything is in memory, and "simulationTick" implemantation is designed to handle missed ticks
          // also not as simple as just calling "simulationTick" multiple times, as it's not idempotent
          ws.data.log.debug(`missed ${missedTicks-1} ticks for slug ${s}`);
        }

        data = simulationTick(data, { now, diff, programDiff });
        ws.data.store.data[s] = data;

        return data;
      }


      const data = getData(slug);
      if (!data) {
        ws.send(`No data found for slug ${slug}`);
        ws.close();
        return;
      }

      // bun's ws pub/sub impl not currently working properly in elysia, so we'll handle intervals manually
      store.intervalStorage[slug] = setInterval(() => ws.send(getData(slug)), getTickSpeed(data))
    }
  })
