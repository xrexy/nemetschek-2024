import { Elysia, t } from "elysia";
import { ctx } from "../context";

export const healthController = new Elysia({
  prefix: "/health",
  name: "api:health",
})
  .use(ctx)
  .get('/', ctx => {
    return "OK"
  })
