import { Elysia } from "elysia";

import { api } from './controllers/*'
import { ws } from './ws/handler'
import { config } from "./config";

import {cors} from '@elysiajs/cors'

const app = new Elysia()
  .use(ws)
  .use(api)
  .use(cors())
  .listen(config.env.PORT);

console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
