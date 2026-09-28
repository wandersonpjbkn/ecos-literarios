import { createRouter, createWebHistory } from 'vue-router'

import { useUtils } from '@/composables'

import Admin from './modules/admin'
import Auth from './modules/auth'
import Catalog from './modules/catalog'
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

router.afterEach((to, from) => {
  // Same page with another query ("Ver mais", a chip, the search) is not another page view.
  if (from.matched.length && to.path === from.path) return
  useUtils().sendGtmEvent({
    event: 'content_view',
    content_name: to.fullPath,
    content_view_name: to.name || to.meta.title || 'unknown',
    gtm_meta: to.meta.gtm || null,
  })
})

export default router
