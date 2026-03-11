export const routes = [
  {
    path: '/midia/:id',
    name: 'midia',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mídia — Ecos Literários' },
  },
  {
    path: '/categoria/:id',
    name: 'categoria',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Categoria — Ecos Literários' },
  },
  {
    path: '/autor/:id',
    name: 'autor',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Autor — Ecos Literários' },
  },
  {
    path: '/mencao/:id',
    name: 'mencao',
    component: () => import('@/views/FilterView.vue'),
    meta: { title: 'Mencionado por — Ecos Literários' },
  },
]

export default {
  routes,
}
