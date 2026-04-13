export const routes = [
  {
    path: '/auth/login',
    name: 'auth-login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Entrar — Ecos Literários', pageClass: 'page-auth' },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/auth/AuthCallbackView.vue'),
    meta: { title: 'Verificando acesso — Ecos Literários', pageClass: 'page-auth' },
  },
]

export default { routes }
