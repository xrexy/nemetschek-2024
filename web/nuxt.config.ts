// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/google-fonts", "nuxt-icon", '@formkit/nuxt'],
  tailwindcss: { viewer: false },
  shadcn: { prefix: '' },
  googleFonts: { families: { Inter: '400..700', } },
  ssr: false,
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:8080/api/v1',
    }
  },
  vue: {
    propsDestructure: true,
  }
})
