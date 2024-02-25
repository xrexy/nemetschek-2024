import { z } from 'zod'

const schema = z.object({
  res: z.array(z.object({
    slug: z.string(),
    analytics: z.any({}),
    warehouses: z.array(z.any({})),
    drones: z.array(z.any({})),
    timeFactorMs: z.number(),
  }))
})

export default defineNuxtRouteMiddleware(async () => {
  const online = useOnlineSimulations()
  const config = useRuntimeConfig()

  const res = await $fetch(`${config.public.apiUrl}/simulation/online`)
  console.log(res);

  const parsed = schema.parse(res);

  /* @ts-ignore schema is very invalid at the moment - don't have enough time at the moment */
  online.value = parsed.res
})
