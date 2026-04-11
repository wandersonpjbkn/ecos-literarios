export const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
    meta: { title: 'Catálogo — Ecos Literários', pageClass: 'page-catalog' },
  },
]

export default {
  routes,
}
