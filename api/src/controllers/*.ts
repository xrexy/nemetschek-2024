
import { Elysia } from "elysia";
import { simulationController } from "./simulation.controller";

export const api = new Elysia({
  prefix: "/api/v1",
  name: "api:root",
})
  .use(simulationController);