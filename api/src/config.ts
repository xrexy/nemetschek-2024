import { z } from 'zod';

const envSchema = z.object({
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('8080'),
})

export const env = envSchema.parse(import.meta.env)

const args = {
  // watch: process.argv.includes("--watch"),
  // liveReload: true,
}

export const config = { env, args }
