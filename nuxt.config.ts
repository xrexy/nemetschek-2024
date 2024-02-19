// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/google-fonts"],
  tailwindcss: { viewer: false },
  shadcn: { prefix: '' },
  googleFonts: { families: { Inter: '400..700', } }
})
