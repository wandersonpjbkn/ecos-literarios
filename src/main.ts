import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import persisteStorage from 'pinia-plugin-persistedstate'
import gtm from '@gtm-support/vue-gtm'

import router from '@/router'
import { setupSentry } from '@/plugins/sentry'

import App from '@/App.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseSpinner from '@/components/BaseSpinner.vue'

import '@/assets/scss/main.scss'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

pinia.use(persisteStorage)

app.use(pinia)
app.use(head)
app.use(router)
app.use(gtm, {
  id: import.meta.env.VITE_GTM_ID,
  defer: false,
  compatibility: false,
  enabled: import.meta.env.PROD,
  loadScript: true,
  vueRouter: router,
  trackOnNextTick: false,
})

setupSentry({
  app,
  router,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: __APP_VERSION__,
})

// global components
app.component('BaseIcon', BaseIcon).component('BaseSpinner', BaseSpinner)

app.mount('#app')
