// https://nuxt.com/docs/api/configuration/nuxt-config
const production = process.env.NODE_ENV === 'production'
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/google-fonts", "nuxt-icon", '@formkit/nuxt'],
  tailwindcss: { viewer: false },
  shadcn: { prefix: '' },
  googleFonts: { families: { Inter: '400..700', } },
  ssr: false,
  runtimeConfig: {
    public: {
      apiUrl: process.env.NT_API_URL ||  production ? 'https://api-production-nemetschek-rkolev.up.railway.app/api/v1' : 'http://localhost:8080/api/v1',
      wsUrl: process.env.NT_WS_URL ||  production ? 'wss://api-production-nemetschek-rkolev.up.railway.app/ws' : 'ws://localhost:8080/ws',
      production
    }
  },
  vue: {
    propsDestructure: true,
  }
})
