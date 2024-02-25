import { Schema, z } from 'zod'

const schema = z.object({
  res: z.array(z.object({
    slug: z.string(),
    analytics: z.any({}),
    warehouses: z.array(z.any({})),
    drones: z.array(z.any({})),
    timeFactorMs: z.number(),
  }))
})

async function fetch(url: string) {
  try {
    const req = await $fetch(url)
    return schema.parse(req).res
  } catch (e) {
    console.error(e)
    return []
  }
}

export default defineNuxtRouteMiddleware(async () => {
  const online = useOnlineSimulations()
  const config = useRuntimeConfig()
  const isApiOnline = useApiOnline()

  watchEffect(async () => {
    if (!isApiOnline.value) {
      online.value = []
      return;
    }

    online.value = await fetch(`${config.public.apiUrl}/simulation/online`)
  })
})
