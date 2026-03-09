import CatalogView from '@/views/CatalogView.vue'

export const routes = [
  {
    path: '/',
    name: 'catalog',
    component: CatalogView,
    meta: { title: 'Catálogo — Ecos Literários' },
  },
]

export default {
  routes,
}
