// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: '/playground/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  css: [
    '@/assets/scss/main.scss',
  ],
  modules: [
    '@nuxtjs/eslint-module'
  ],
})
