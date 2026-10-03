import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores'

const authGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: to.fullPath } }
}

export const routes: RouteRecordRaw[] = [
  { path: '/perfil', redirect: { name: 'profile-books' } },
  {
    path: '/perfil/livros',
    name: 'profile-books',
    beforeEnter: authGuard,
    component: () => import('@/views/profile/ProfileBooks.vue'),
    meta: { title: 'Meus livros', pageClass: 'page-profile', signedIn: true },
  },
  {
    path: '/perfil/conta',
    name: 'profile-account',
    beforeEnter: authGuard,
    component: () => import('@/layouts/AccountLayout.vue'),
    redirect: { name: 'account-you' },
    meta: { frame: 'area', signedIn: true },
    children: [
      {
        path: 'voce',
        name: 'account-you',
        component: () => import('@/views/profile/AccountNameSection.vue'),
        meta: { title: 'Perfil · Minha conta', pageClass: 'page-profile' },
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
        meta: { title: 'Vincular meu nome · Minha conta', pageClass: 'page-profile' },
      },
      {
        path: 'aparelho',
        name: 'account-device',
        component: () => import('@/views/profile/DeviceSection.vue'),
        meta: { title: 'Dados salvos · Minha conta', pageClass: 'page-profile' },
      },
    ],
  },
  { path: '/perfil/vinculos', name: 'profile-claim', redirect: { name: 'account-claim' } },
]

export default { routes }
