import { createRouter, createWebHistory } from 'vue-router'

import { sendGtmEvent } from '@/utils/gtm'

import Catalog from './modules/catalog'
import Book from './modules/books'
import Filter from './modules/filter'

const routes = [...Catalog.routes, ...Book.routes, ...Filter.routes]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  window.document.title = (to.meta.title as string) || 'Ecos Literários'

  sendGtmEvent({
    event: 'content_view',
    content_name: to.fullPath,
    content_view_name: to.name || to.meta.title || 'unknown',
    gtm_meta: to.meta.gtm || null,
  })
})

export default router
