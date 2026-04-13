import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

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
    beforeEnter: adminGuard,
    redirect: { name: 'admin-members' },
    children: [
      {
        path: 'membros',
        name: 'admin-members',
        component: () => import('@/views/admin/AdminMembers.vue'),
        meta: { title: 'Membros — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'permissoes',
        name: 'admin-permissions',
        component: () => import('@/views/admin/AdminPermissions.vue'),
        meta: { title: 'Permissões — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'enriquecimento',
        name: 'admin-enrichment',
        component: () => import('@/views/admin/AdminEnrichment.vue'),
        meta: { title: 'Enriquecimento — Painel Admin', pageClass: 'page-admin' },
      },
      {
        path: 'vinculos',
        name: 'admin-claims',
        component: () => import('@/views/admin/AdminClaimHistory.vue'),
        meta: { title: 'Vínculos — Painel Admin', pageClass: 'page-admin' },
      },
    ],
  },
]

export default { routes }
