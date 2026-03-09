import BookView from '@/views/BookView.vue'

export const routes = [
  {
    path: '/livro/:id',
    name: 'book',
    component: BookView,
    meta: { title: 'Livro — Ecos Literários' },
  },
]

export default {
  routes,
}
