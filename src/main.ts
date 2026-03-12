import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import persisteStorage from 'pinia-plugin-persistedstate'
import gtm from '@gtm-support/vue-gtm'

import router from '@/router'

import App from '@/App.vue'

import '@/assets/scss/main.scss'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persisteStorage)

app.use(pinia)
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

app.component(
  'BaseIcon',
  defineAsyncComponent(() => import('@/components/BaseIcon.vue')),
)

app.mount('#app')
