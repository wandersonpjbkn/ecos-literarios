import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores'

// Signed out goes to the login and comes back to the page it asked for (?voltar).
const authGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: to.fullPath } }
}

// Meus livros lives in the catalog frame; Minha conta is an area like the club panel (estudo-moldura.md).
export const routes: RouteRecordRaw[] = [
  { path: '/perfil', redirect: { name: 'profile-books' } },
  {
    path: '/perfil/livros',
    name: 'profile-books',
    beforeEnter: authGuard,
    component: () => import('@/views/profile/ProfileBooks.vue'),
    meta: { title: 'Meus livros', pageClass: 'page-profile' },
  },
  {
    path: '/perfil/conta',
    name: 'profile-account',
    beforeEnter: authGuard,
    component: () => import('@/layouts/AccountLayout.vue'),
    redirect: { name: 'account-you' },
    // An area with its own frame, like the club panel (estudo-moldura.md).
    meta: { frame: 'area' },
    children: [
      {
        path: 'voce',
        name: 'account-you',
        component: () => import('@/views/profile/AccountNameSection.vue'),
        meta: { title: 'Você · Minha conta', pageClass: 'page-profile' },
      },
      {
        path: 'formatos',
        name: 'account-formats',
        component: () => import('@/views/profile/HiddenFormatsSection.vue'),
        meta: { title: 'O que você quer ver · Minha conta', pageClass: 'page-profile' },
      },
      {
        path: 'nome-no-grupo',
        name: 'account-claim',
        component: () => import('@/views/profile/ClaimNameSection.vue'),
        meta: { title: 'Seu nome no grupo · Minha conta', pageClass: 'page-profile' },
      },
      {
        path: 'aparelho',
        name: 'account-device',
        component: () => import('@/views/profile/DeviceSection.vue'),
        meta: { title: 'Este aparelho · Minha conta', pageClass: 'page-profile' },
      },
    ],
  },
  { path: '/perfil/vinculos', name: 'profile-claim', redirect: { name: 'account-claim' } },
]

export default { routes }
