import { Elysia } from "elysia";

import { api } from './controllers/*'
import { ws } from './ws/handler'
import { config } from "./config";
const app = new Elysia()
  .use(ws)
  .use(api)
  .listen(config.env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
