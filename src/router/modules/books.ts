export const routes = [
  {
    path: '/livro/:id',
    name: 'book',
    component: () => import('@/views/BookView.vue'),
    meta: { title: 'Livro — Ecos Literários', pageClass: 'book-page' },
  },
]

export default {
  routes,
}
