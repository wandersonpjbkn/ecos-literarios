import { createApp, defineAsyncComponent } from 'vue'
import { createPinia } from 'pinia'
import persisteStorage from 'pinia-plugin-persistedstate'

import router from '@/router'

import App from '@/App.vue'

import '@/assets/scss/main.scss'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persisteStorage)

app.use(pinia)
app.use(router)

app.component(
  'BaseIcon',
  defineAsyncComponent(() => import('@/components/BaseIcon.vue')),
)

app.mount('#app')
