// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-auth-utils'],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light', // 'system' | 'light' | 'dark' | 'sepia'
    fallback: 'light'
  },

  runtimeConfig: {
    apiSecret: '',
    appEnv: '',
    session: {
      password: '',
      maxAge: 60 * 60 * 24 * 30,
      cookie: {
        // @ts-expect-error process is available at Nuxt config evaluation time
        secure: (process.env.NUXT_APP_ENV || 'production') === 'production'
      }
    },
    public: {
      apiBase: '',
      encryptKey: '',
      googleClientId: ''
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
