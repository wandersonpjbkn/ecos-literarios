import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import type { Action, Resource } from '@/types'

import { useAuthStore, usePermissionsStore } from '@/stores'

// Signed out goes to the login and back here; signed in without the level sees why (AdminForbidden).
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

// The one place that says a section is admin only: the guard and the panel menu both read it.
const adminRoute = (route: RouteRecordRaw): RouteRecordRaw => ({
  ...route,
  beforeEnter: adminGuard,
  meta: { ...route.meta, adminOnly: true },
})

/** Whether this account may open a section the matrix controls; before users/me answers, the level stands in. */
export const mayOpen = (permission: { resource: Resource; action: Action }): boolean => {
  const permissions = usePermissionsStore()
  return permissions.mine ? permissions.can(permission.resource, permission.action) : useAuthStore().isEditor
}

// A section that follows the matrix (Permissões), not a fixed level: the guard and the panel menu both read it.
const permissionRoute = (route: RouteRecordRaw, resource: Resource, action: Action): RouteRecordRaw => ({
  ...route,
  beforeEnter: (to: RouteLocationNormalized) => {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: to.fullPath } }
    if (!mayOpen({ resource, action })) return { name: 'admin-forbidden' }
  },
  meta: { ...route.meta, permission: { resource, action } },
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
    // The panel is a tool, not part of the catalog: it brings its own bar and leaves the app's header and rail out.
    meta: { frame: 'area' },
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
      permissionRoute(
        {
          path: 'capas',
          name: 'admin-enrichment',
          alias: 'enriquecimento',
          component: () => import('@/views/admin/AdminEnrichment.vue'),
          meta: { title: 'Capas e sinopses · Painel do clube', pageClass: 'page-admin' },
        },
        'enrichment',
        'update',
      ),
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
