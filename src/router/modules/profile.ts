import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

const authGuard = () => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return { name: 'auth-login' }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/perfil',
    component: () => import('@/views/profile/ProfileLayout.vue'),
    beforeEnter: authGuard,
    redirect: { name: 'profile-books' },
    children: [
      {
        path: 'livros',
        name: 'profile-books',
        component: () => import('@/views/profile/ProfileBooks.vue'),
        meta: { title: 'Meus livros — Ecos Literários', pageClass: 'page-profile' },
      },
      {
        path: 'conta',
        name: 'profile-account',
        component: () => import('@/views/profile/ProfileAccount.vue'),
        meta: { title: 'Conta — Ecos Literários', pageClass: 'page-profile' },
      },
      {
        path: 'vinculos',
        name: 'profile-claim',
        component: () => import('@/views/profile/ProfileClaim.vue'),
        meta: { title: 'Vínculos — Ecos Literários', pageClass: 'page-profile' },
      },
    ],
  },
]

export default { routes }
