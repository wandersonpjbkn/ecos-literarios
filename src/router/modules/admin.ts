import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

const editorGuard = () => {
  const auth = useAuthStore()
  if (!auth.isEditor) return { name: 'admin-forbidden' }
}

const adminGuard = () => {
  const auth = useAuthStore()
  if (!auth.isAdmin) return { name: 'admin-forbidden' }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/admin/forbidden',
    name: 'admin-forbidden',
    component: () => import('@/views/admin/AdminForbidden.vue'),
    meta: { title: 'Sem permissão — Ecos Literários', pageClass: 'page-admin' },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    beforeEnter: editorGuard,
    redirect: { name: 'admin-books' },
    children: [
      {
        path: 'livros',
        name: 'admin-books',
        component: () => import('@/views/admin/AdminBooks.vue'),
        meta: { title: 'Livros — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'membros',
        name: 'admin-members',
        beforeEnter: adminGuard,
        component: () => import('@/views/admin/AdminMembers.vue'),
        meta: { title: 'Membros — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'permissoes',
        name: 'admin-permissions',
        beforeEnter: adminGuard,
        component: () => import('@/views/admin/AdminPermissions.vue'),
        meta: { title: 'Permissões — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'dados',
        name: 'admin-entities',
        component: () => import('@/views/admin/AdminEntities.vue'),
        meta: { title: 'Dados — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'enriquecimento',
        name: 'admin-enrichment',
        beforeEnter: adminGuard,
        component: () => import('@/views/admin/AdminEnrichment.vue'),
        meta: { title: 'Enriquecimento — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'vinculos',
        name: 'admin-claims',
        beforeEnter: adminGuard,
        component: () => import('@/views/admin/AdminClaimHistory.vue'),
        meta: { title: 'Vínculos — Painel Admin', pageClass: 'page-admin' },
      },
    ],
  },
]

export default { routes }
