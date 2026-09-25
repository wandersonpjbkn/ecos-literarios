import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFilters } from '@/composables/useFilters'

const CATALOG_ROUTE = 'catalog-books'

/** Header search: filters the catalog in place, and from any other page it takes the reader to the catalog. */
export function useCatalogSearch() {
  const route = useRoute()
  const router = useRouter()
  const { search, searchSuggestions, filtered } = useFilters()

  const onCatalog = computed(() => route.name === CATALOG_ROUTE)

  const model = computed({
    get: () => (onCatalog.value ? search.value : ''),
    set: (value: string) => {
      if (onCatalog.value) search.value = value
      else if (value.trim()) router.push({ name: CATALOG_ROUTE, query: { busca: value } })
    },
  })

  return {
    model,
    onCatalog,
    suggestions: computed(() => (onCatalog.value ? searchSuggestions.value : [])),
    filteredCount: computed(() => (onCatalog.value ? filtered.value.length : undefined)),
  }
}
