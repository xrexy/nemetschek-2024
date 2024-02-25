// https://nuxt.com/docs/api/configuration/nuxt-config

const production = process.env.NODE_ENV === 'production'
console.log(production)
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/google-fonts", "nuxt-icon", '@formkit/nuxt'],
  tailwindcss: { viewer: false },
  shadcn: { prefix: '' },
  googleFonts: { families: { Inter: '400..700', } },
  ssr: false,
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || production ? 'http://api-nemetschek-2024.railway.internal:8944/api/v1' : 'http://localhost:8080/api/v1',
      wsUrl: process.env.WS_URL || production ? 'ws://api-nemetschek-2024.railway.internal:8944/ws' : 'ws://localhost:8080/ws',
      production,
    }
  },
  vue: {
    propsDestructure: true,
  }
})
