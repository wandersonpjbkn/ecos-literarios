import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores'

const editorGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: to.fullPath } }
  if (!auth.isEditor) return { name: 'admin-forbidden' }
}

const adminGuard = (to: RouteLocationNormalized) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: to.fullPath } }
  if (!auth.isAdmin) return { name: 'admin-forbidden' }
}

const adminRoute = (route: RouteRecordRaw): RouteRecordRaw => ({
  ...route,
  beforeEnter: adminGuard,
  meta: { ...route.meta, adminOnly: true },
})

export const routes: RouteRecordRaw[] = [
  {
    path: '/admin/forbidden',
    name: 'admin-forbidden',
    component: () => import('@/views/admin/AdminForbidden.vue'),
    meta: { title: 'Sem permissão', pageClass: 'page-admin' },
  },
  {
    path: '/admin',
    component: () => import('@/layouts/ClubPanelLayout.vue'),
    beforeEnter: editorGuard,
    redirect: { name: 'admin-books' },
    meta: { frame: 'area', signedIn: true },
    children: [
      {
        path: 'livros',
        name: 'admin-books',
        component: () => import('@/views/admin/AdminBooks.vue'),
        meta: { title: 'Livros · Painel do clube', pageClass: 'page-admin' },
      },
      adminRoute({
        path: 'membros',
        name: 'admin-members',
        component: () => import('@/views/admin/AdminMembers.vue'),
        meta: { title: 'Membros · Painel do clube', pageClass: 'page-admin' },
      }),
      adminRoute({
        path: 'permissoes',
        name: 'admin-permissions',
        component: () => import('@/views/admin/AdminPermissions.vue'),
        meta: { title: 'Permissões · Painel do clube', pageClass: 'page-admin' },
      }),
      {
        path: 'dados',
        name: 'admin-entities',
        component: () => import('@/views/admin/AdminEntities.vue'),
        meta: { title: 'Autores e gêneros · Painel do clube', pageClass: 'page-admin' },
      },
      { path: 'capas', alias: 'enriquecimento', redirect: { name: 'admin-books', query: { mostrar: 'faltando' } } },
      adminRoute({
        path: 'vinculos',
        name: 'admin-claims',
        component: () => import('@/views/admin/AdminClaimHistory.vue'),
        meta: { title: 'Histórico de vínculos · Painel do clube', pageClass: 'page-admin' },
      }),
    ],
  },
]

export default { routes }
