// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Catalog from './modules/catalog'
import Book from './modules/books'

const routes = [...Catalog.routes, ...Book.routes]

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
})

export default router
