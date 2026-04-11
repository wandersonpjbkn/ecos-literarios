export const routes = [
  {
    path: '/midia/:slug',
    name: 'midia',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mídia — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/categoria/:slug',
    name: 'categoria',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Categoria — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/autor/:slug',
    name: 'autor',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Autor — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/mencao/:slug',
    name: 'mencao',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mencionado por — Ecos Literários', pageClass: 'page-filter' },
  },
]

export default {
  routes,
}
