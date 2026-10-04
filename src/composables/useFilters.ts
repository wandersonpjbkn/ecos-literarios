import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw, type RouteLocationRaw } from 'vue-router'

import { matchesSearch, titleSuggestions } from '@/data/bookSearch'
import type { Book, BookSortOrder, FilterKey, Options } from '@/types'

import { useBooksStore, usePreferencesStore } from '@/stores'

import { useUtils } from '@/composables/useUtils'

const FILTER_KEYS: FilterKey[] = ['midia', 'categoria', 'subgenres', 'person', 'authors', 'size']

const QUERY_PARAM: Record<FilterKey, string> = {
  midia: 'midia',
  categoria: 'genero',
  subgenres: 'subgenero',
  person: 'quem',
  authors: 'autor',
  size: 'tamanho',
}

const SIZES: { slug: string; label: string; phrase: string; match: (book: Book) => boolean }[] = [
  {
    slug: 'curto',
    label: 'Menos de 200 páginas',
    phrase: 'com menos de 200 páginas',
    match: (b) => !!b.page_count && b.page_count < 200,
  },
  {
    slug: 'medio',
    label: 'De 200 a 500 páginas',
    phrase: 'de 200 a 500 páginas',
    match: (b) => !!b.page_count && b.page_count >= 200 && b.page_count <= 500,
  },
  {
    slug: 'longo',
    label: 'Mais de 500 páginas',
    phrase: 'com mais de 500 páginas',
    match: (b) => !!b.page_count && b.page_count > 500,
  },
  {
    slug: 'desconhecido',
    label: 'Não sabemos quantas páginas',
    phrase: 'sem o número de páginas',
    match: (b) => !b.page_count,
  },
]

const orList = (values: string[]) => values.join(' ou ')
const inSentence = (value: string) => (value === value.toUpperCase() ? value : value.toLowerCase())

export const describeSelection = (selection: Options): string => {
  const kinds = [...selection.categoria, ...selection.subgenres].map(inSentence)
  const formats = selection.midia.map(inSentence)
  const parts = [
    'Nenhum livro',
    kinds.length && `de ${orList(kinds)}`,
    formats.length && `em ${orList(formats)}`,
    selection.size.length && orList(selection.size.map((label) => SIZES.find((s) => s.label === label)!.phrase)),
    selection.authors.length && `de ${orList(selection.authors)}`,
    selection.person.length && `mencionado por ${orList(selection.person)}`,
  ]
  return `${parts.filter(Boolean).join(' ')}.`
}

const valuesOf = (book: Book, key: FilterKey): string[] => {
  if (key === 'size') return SIZES.filter((size) => size.match(book)).map((size) => size.label)
  if (key === 'subgenres') return book.subgenreNames ?? []
  if (key === 'authors') return book.authors ?? []
  const value = book[key]
  return value ? [value] : []
}

const emptySelection = (): Options => Object.fromEntries(FILTER_KEYS.map((key) => [key, []])) as unknown as Options

const applyFilters = (books: Book[], selection: Options, search: string, hiddenFormats: string[]) => {
  return books.filter((book) => {
    if (!matchesSearch(book, search)) return false
    if (!selection.midia.length && hiddenFormats.includes(book.midia)) return false
    return FILTER_KEYS.every(
      (key) => !selection[key].length || valuesOf(book, key).some((value) => selection[key].includes(value)),
    )
  })
}

export function useFilters() {
  const route = useRoute()
  const router = useRouter()

  const { hiddenFormats } = storeToRefs(usePreferencesStore())

  const { slugify } = useUtils()

  const books = computed(() => useBooksStore().books)

  // ── Options and their counts over the whole catalog ─────────────
  const options = computed(
    (): Options =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => [
          key,
          key === 'size'
            ? SIZES.map((size) => size.label)
            : [...new Set(books.value.flatMap((book) => valuesOf(book, key)))].sort((a, b) =>
                a.localeCompare(b, 'pt-BR'),
              ),
        ]),
      ) as unknown as Options,
  )

  const optionCounts = computed(() => {
    const counts = Object.fromEntries(FILTER_KEYS.map((key) => [key, {} as Record<string, number>]))
    for (const book of books.value) {
      for (const key of FILTER_KEYS) {
        for (const value of valuesOf(book, key)) counts[key]![value] = (counts[key]![value] ?? 0) + 1
      }
    }
    return counts as Record<FilterKey, Record<string, number>>
  })

  const selected = computed(
    (): Options =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => {
          const slugs = String(route.query[QUERY_PARAM[key]] ?? '')
            .split(',')
            .map((slug) => slug.trim())
            .filter(Boolean)
          return [key, options.value[key].filter((value) => slugs.includes(toSlug(key, value)))]
        }),
      ) as unknown as Options,
  )

  const search = computed({
    get: () => String(route.query.busca ?? ''),
    set: (value: string) => {
      const query: LocationQueryRaw = { ...route.query, busca: value }
      if (!value.trim()) delete query.busca
      router.replace({ query })
    },
  })

  const filtered = computed(() => applyFilters(books.value, selected.value, search.value, hiddenFormats.value))

  const hiddenByPreference = computed(() => {
    if (selected.value.midia.length) return []
    const wouldShow = applyFilters(books.value, selected.value, search.value, [])
    return hiddenFormats.value
      .map((format) => ({ format, count: wouldShow.filter((book) => book.midia === format).length }))
      .filter((entry) => entry.count > 0)
  })

  const hasFilters = computed(() => FILTER_KEYS.some((key) => selected.value[key].length > 0))

  const searchSuggestions = computed(() => titleSuggestions(books.value, search.value))

  const toSlug = (key: FilterKey, value: string) =>
    key === 'size' ? (SIZES.find((size) => size.label === value)?.slug ?? '') : slugify(value)

  const queryFor = (selection: Options): LocationQueryRaw => {
    const query: LocationQueryRaw = { ...route.query }
    for (const key of FILTER_KEYS) {
      const slugs = selection[key].map((value) => toSlug(key, value)).join(',')
      if (slugs) query[QUERY_PARAM[key]] = slugs
      else delete query[QUERY_PARAM[key]]
    }
    return query
  }

  const withToggled = (key: FilterKey, value: string): Options => {
    const current = selected.value[key]
    return {
      ...selected.value,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    }
  }

  const catalogLink = (key: FilterKey, value: string): RouteLocationRaw => ({
    name: 'catalog-books',
    query: { [QUERY_PARAM[key]]: toSlug(key, value) },
  })

  const hrefToggling = (key: FilterKey, value: string): RouteLocationRaw => ({
    query: queryFor(withToggled(key, value)),
  })

  const apply = (selection: Options, ordem?: BookSortOrder, replace = false) => {
    const query = { ...queryFor(selection), ...(ordem ? { ordem } : {}) }
    return replace ? router.replace({ query }) : router.push({ query })
  }

  const clearAll = () => {
    const query = queryFor(emptySelection())
    delete query.busca
    return router.push({ query })
  }

  const filteredIgnoring = (key: FilterKey) =>
    applyFilters(books.value, { ...selected.value, [key]: [] }, search.value, hiddenFormats.value)

  const booksFor = (selection: Options) => applyFilters(books.value, selection, '', hiddenFormats.value)

  return {
    emptySelection,
    search,
    options,
    optionCounts,
    selected,
    hasFilters,
    withToggled,
    hrefToggling,
    catalogLink,
    apply,
    clearAll,
    filtered,
    filteredIgnoring,
    booksFor,
    hiddenByPreference,
    searchSuggestions,
  }
}
