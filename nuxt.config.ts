import Aura from '@primevue/themes/aura';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    ['@primevue/nuxt-module', {
      options: {
        theme: {
          preset: Aura
        }
      }
    }]
  ],

  css: [
    '@/assets/css/main.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),

    ]
  }

})