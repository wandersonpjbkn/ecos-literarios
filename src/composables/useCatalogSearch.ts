import { computed } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import { useFilters } from '@/composables/useFilters'
import { useLastList } from '@/composables/useLastCatalog'

const CATALOG_ROUTE = 'catalog-books'
const MY_BOOKS_ROUTE = 'profile-books'

export function useCatalogSearch() {
  const route = useRoute()
  const router = useRouter()
  const lastList = useLastList()
  const { search, searchSuggestions } = useFilters()

  const onCatalog = computed(() => route.name === CATALOG_ROUTE)
  const onMyBooks = computed(() => route.name === MY_BOOKS_ROUTE)
  const fromMyBooks = computed(() => lastList.value.path.startsWith('/perfil/livros'))

  const model = computed({
    get: () => (onCatalog.value ? search.value : onMyBooks.value ? String(route.query.busca ?? '') : ''),
    set: (value: string) => {
      if (onCatalog.value) search.value = value
      else if (onMyBooks.value) {
        const query: LocationQueryRaw = { ...route.query, busca: value }
        if (!value.trim()) delete query.busca
        router.replace({ query })
      } else if (value.trim()) {
        router.push({ name: fromMyBooks.value ? MY_BOOKS_ROUTE : CATALOG_ROUTE, query: { busca: value } })
      }
    },
  })

  return {
    model,
    onCatalog,
    onMyBooks,
    searchesMyBooks: computed(() => onMyBooks.value || (!onCatalog.value && fromMyBooks.value)),
    suggestions: computed(() => (onCatalog.value ? searchSuggestions.value : [])),
  }
}
