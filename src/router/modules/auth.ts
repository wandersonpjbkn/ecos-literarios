import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/auth/login',
    name: 'auth-login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Entrar', pageClass: 'page-auth', frame: 'auth' },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/auth/AuthCallbackView.vue'),
    meta: { title: 'Entrando', pageClass: 'page-auth', frame: 'auth' },
  },
]

export default { routes }
