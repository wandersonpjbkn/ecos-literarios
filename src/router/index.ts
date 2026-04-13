import { createRouter, createWebHistory } from 'vue-router'

import { useUtils } from '@/composables'

import Catalog from './modules/catalog'
import Auth from './modules/auth'
import Admin from './modules/admin'
import Profile from './modules/profile'

const routes = [...Catalog.routes, ...Auth.routes, ...Admin.routes, ...Profile.routes]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  useUtils().sendGtmEvent({
    event: 'content_view',
    content_name: to.fullPath,
    content_view_name: to.name || to.meta.title || 'unknown',
    gtm_meta: to.meta.gtm || null,
  })
})

export default router
