export const routes = [
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
  {
    path: '/midia/:slug',
    name: 'catalog-midia',
    component: () => import('@/views/catalog/FilterView.vue'),
    meta: { title: 'Mídia — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/categoria/:slug',
    name: 'catalog-category',
    component: () => import('@/views/catalog/FilterView.vue'),
    meta: { title: 'Categoria — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/autor/:slug',
    name: 'catalog-author',
    component: () => import('@/views/catalog/FilterView.vue'),
    meta: { title: 'Autor — Ecos Literários', pageClass: 'page-filter' },
  },
  {
    path: '/mencao/:slug',
    name: 'catalog-mention',
    component: () => import('@/views/catalog/FilterView.vue'),
    meta: { title: 'Mencionado por — Ecos Literários', pageClass: 'page-filter' },
  },
]

export default {
  routes,
}
