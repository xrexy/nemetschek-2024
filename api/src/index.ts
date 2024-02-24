import { Elysia } from "elysia";

import { api } from './controllers/*'
import { ws } from './ws/handler'
const app = new Elysia()
  .use(ws)
  .use(api)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
