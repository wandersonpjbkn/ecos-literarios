import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

const adminGuard = () => {
  const auth = useAuthStore()
  if (!auth.isAdmin) return { name: 'admin-forbidden' }
}

export const routes: RouteRecordRaw[] = [
  // Tela de acesso negado — sem guard (precisa ser acessível)
  {
    path: '/admin/forbidden',
    name: 'admin-forbidden',
    component: () => import('@/views/admin/AdminForbidden.vue'),
    meta: { title: 'Sem permissão — Ecos Literários' },
  },

  // Shell do painel admin com children
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    beforeEnter: adminGuard,
    redirect: { name: 'admin-membros' },
    children: [
      {
        path: 'membros',
        name: 'admin-membros',
        component: () => import('@/views/admin/AdminMembros.vue'),
        meta: { title: 'Membros — Painel Admin' },
      },
      {
        path: 'permissoes',
        name: 'admin-permissoes',
        component: () => import('@/views/admin/AdminPermissoes.vue'),
        meta: { title: 'Permissões — Painel Admin' },
      },
    ],
  },
]

export default { routes }
