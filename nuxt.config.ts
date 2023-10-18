// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  css: [
    '@/assets/scss/abstracts/_functions.scss',
    '@/assets/scss/abstracts/_variables.scss',
    '@/assets/scss/abstracts/_mixins.scss',
    '@/assets/scss/main.scss',
  ],
  modules: [
    '@nuxtjs/eslint-module'
  ],
  eslint: {
    /* module options */
  }
})
