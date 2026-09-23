import type { RouteLocation, RouteRecordRaw } from 'vue-router'

// Old per-filter pages were shared in the club group; they keep their names and land on the catalog query.
const toCatalogQuery = (param: string) => (to: RouteLocation) => ({
  path: '/',
  query: { [param]: String(to.params.slug) },
})

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'catalog-books',
    component: () => import('@/views/catalog/BooksView.vue'),
    meta: { title: 'Catálogo — Ecos Literários', pageClass: 'page-catalog' },
  },
  {
    path: '/livro/:id',
    name: 'catalog-book-details',
    component: () => import('@/views/catalog/BookDetailsView.vue'),
    meta: { title: 'Livro — Ecos Literários', pageClass: 'page-book' },
  },
  { path: '/midia/:slug', name: 'catalog-midia', redirect: toCatalogQuery('midia') },
  { path: '/categoria/:slug', name: 'catalog-category', redirect: toCatalogQuery('genero') },
  { path: '/autor/:slug', name: 'catalog-author', redirect: toCatalogQuery('autor') },
  { path: '/mencao/:slug', name: 'catalog-mention', redirect: toCatalogQuery('quem') },
]

export default {
  routes,
}
