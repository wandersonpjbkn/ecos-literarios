export const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Entrar — Ecos Literários' },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: { title: 'Verificando acesso — Ecos Literários' },
  },
]

export default { routes }
