export const routes = [
  {
    path: '/midia/:slug',
    name: 'midia',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mídia — Ecos Literários' },
  },
  {
    path: '/categoria/:slug',
    name: 'categoria',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Categoria — Ecos Literários' },
  },
  {
    path: '/autor/:slug',
    name: 'autor',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Autor — Ecos Literários' },
  },
  {
    path: '/mencao/:slug',
    name: 'mencao',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mencionado por — Ecos Literários' },
  },
]

export default {
  routes,
}
