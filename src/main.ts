import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persisteStorage from 'pinia-plugin-persistedstate'

import router from '@/router'

import App from '@/App.vue'
import BaseIcon from '@/components/BaseIcon.vue'

import '@/assets/main.scss'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persisteStorage)

app.use(pinia)
app.use(router)

app.component('BaseIcon', BaseIcon)

app.mount('#app')
