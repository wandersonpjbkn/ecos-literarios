import { createApp } from 'vue'
import { createPinia } from 'pinia'

import router from '@/router'

import App from '@/App.vue'
import BaseIcon from '@/components/BaseIcon.vue'

import '@/assets/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('BaseIcon', BaseIcon)

app.mount('#app')
