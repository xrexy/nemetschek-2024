import { logger } from '@bogeychan/elysia-logger'
import { Elysia } from 'elysia'

import pretty from 'pino-pretty'

import { config } from './config'

import type { Position } from './types/position'
import type { SimulationData } from './types/simulation'
import { distanceBetween } from './utils/distance'

const loggerConfig
  = config.env.NODE_ENV === 'development'
    ? {
      level: config.env.LOG_LEVEL,
      stream: pretty({
        colorize: true,
      }),
    }
    : { level: config.env.LOG_LEVEL }

export const ctx = new Elysia({
  name: '@app/ctx',
})
  .state('config', config)
  .state('data', {} as Record<string, SimulationData>)
  .state('intervalStorage', {} as Record<string, Timer>)
  .decorate('utils', { distanceBetween })

  .use(logger(loggerConfig))
  .onResponse(({ log, request }) => {
    if (log && config.env.NODE_ENV === 'production')
      log.debug(`Response sent: ${request.method}: ${request.url}`)
  })
  .onError(({ log, error }) => {
    if (log && config.env.NODE_ENV === 'production') log.error(error)
  })
