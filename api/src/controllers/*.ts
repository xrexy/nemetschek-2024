
import { Elysia } from "elysia";

import { simulationController } from "./simulation.controller";
import { healthController } from "./health.controller";


export const api = new Elysia({
  prefix: "/api/v1",
  name: "api:root",
})
  .use(simulationController)
  .use(healthController);
