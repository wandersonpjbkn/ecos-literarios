export const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
    meta: { title: 'Catálogo — Ecos Literários' },
  },
]

export default {
  routes,
}
