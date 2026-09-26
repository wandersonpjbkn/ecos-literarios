import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter, type LocationQueryRaw, type RouteLocationRaw } from 'vue-router'

import { useBooksStore, usePreferencesStore } from '@/stores'
import { useUtils } from '@/composables/useUtils'
import type { Book, BookSortOrder, FilterKey, Options } from '@/types'

const FILTER_KEYS: FilterKey[] = ['midia', 'categoria', 'subgeneros', 'quem', 'autor', 'tamanho']

// Query names are part of links already shared in the club group: renaming one breaks them.
const QUERY_PARAM: Record<FilterKey, string> = {
  midia: 'midia',
  categoria: 'genero',
  subgeneros: 'subgenero',
  quem: 'quem',
  autor: 'autor',
  tamanho: 'tamanho',
}

// `phrase` completes "Nada de …" in the empty state (EmptyState.md: the combination said in Portuguese).
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
    phrase: 'com 200 a 500 páginas',
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

/**
 * The applied filters as one sentence, "Nada de terror mencionado por Natália." No gendered article ("pela"):
 * the data does not say anyone's gender.
 */
export const describeSelection = (selection: Options): string => {
  const kinds = [...selection.categoria, ...selection.subgeneros].map(inSentence)
  const formats = selection.midia.map(inSentence)
  const noun = kinds.length ? orList(kinds) : formats.length ? orList(formats) : 'livro'
  const parts = [
    `Nada de ${noun}`,
    kinds.length && formats.length && `em ${orList(formats)}`,
    selection.tamanho.length && orList(selection.tamanho.map((label) => SIZES.find((s) => s.label === label)!.phrase)),
    selection.autor.length && `de ${orList(selection.autor)}`,
    selection.quem.length && `mencionado por ${orList(selection.quem)}`,
  ]
  return `${parts.filter(Boolean).join(' ')}.`
}

const valuesOf = (book: Book, key: FilterKey): string[] => {
  if (key === 'tamanho') return SIZES.filter((size) => size.match(book)).map((size) => size.label)
  if (key === 'subgeneros') return book.subgenerosArr ?? []
  const value = book[key]
  return value ? [value] : []
}

const emptySelection = (): Options => Object.fromEntries(FILTER_KEYS.map((key) => [key, []])) as unknown as Options

/** OR inside a group, AND across groups; the format preference only applies when the URL does not pick a format. */
const applyFilters = (books: Book[], selection: Options, search: string, hiddenMidias: string[]) => {
  const q = search.trim().toLowerCase()
  return books.filter((book) => {
    if (q && ![book.titulo, book.autor, book.quem, book.porque].some((field) => field?.toLowerCase().includes(q)))
      return false
    if (!selection.midia.length && hiddenMidias.includes(book.midia)) return false
    return FILTER_KEYS.every(
      (key) => !selection[key].length || valuesOf(book, key).some((value) => selection[key].includes(value)),
    )
  })
}

export function useFilters() {
  const route = useRoute()
  const router = useRouter()
  const { slugify } = useUtils()
  const { hiddenMidias } = storeToRefs(usePreferencesStore())

  const books = computed(() => useBooksStore().books)

  const toSlug = (key: FilterKey, value: string) =>
    key === 'tamanho' ? (SIZES.find((size) => size.label === value)?.slug ?? '') : slugify(value)

  // ── Options and their counts over the whole catalog ─────────────
  const options = computed(
    (): Options =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => [
          key,
          key === 'tamanho'
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

  // ── Selection lives in the URL; unknown slugs are ignored ───────
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

  /** The catalog filtered by one value, for links outside the catalog (the open book). */
  const catalogLink = (key: FilterKey, value: string): RouteLocationRaw => ({
    name: 'catalog-books',
    query: { [QUERY_PARAM[key]]: toSlug(key, value) },
  })

  /** Location with one value toggled, for filters rendered as real links. */
  const hrefToggling = (key: FilterKey, value: string): RouteLocationRaw => ({
    query: queryFor(withToggled(key, value)),
  })

  /** `ordem` comes along when the drawer also holds the sort (mobile); `replace` keeps one history entry per drawer visit. */
  const apply = (selection: Options, ordem?: BookSortOrder, replace = false) => {
    const query = { ...queryFor(selection), ...(ordem ? { ordem } : {}) }
    return replace ? router.replace({ query }) : router.push({ query })
  }

  const clearAll = () => {
    const query = queryFor(emptySelection())
    delete query.busca
    return router.push({ query })
  }

  const search = computed({
    get: () => String(route.query.busca ?? ''),
    set: (value: string) => {
      const query: LocationQueryRaw = { ...route.query, busca: value }
      if (!value.trim()) delete query.busca
      router.replace({ query })
    },
  })

  const filtered = computed(() => applyFilters(books.value, selected.value, search.value, hiddenMidias.value))

  /** Books a selection opens from a link (no search, format preference in force), so a shelf count matches its page. */
  const booksFor = (selection: Options) => applyFilters(books.value, selection, '', hiddenMidias.value)

  /** Books left out only because of the format preference, per hidden format. */
  const hiddenByPreference = computed(() => {
    if (selected.value.midia.length) return []
    const wouldShow = applyFilters(books.value, selected.value, search.value, [])
    return hiddenMidias.value
      .map((midia) => ({ midia, count: wouldShow.filter((book) => book.midia === midia).length }))
      .filter((entry) => entry.count > 0)
  })

  const hasFilters = computed(() => FILTER_KEYS.some((key) => selected.value[key].length > 0))

  const searchSuggestions = computed(() => {
    if (!search.value.trim() || search.value.length < 2) return []

    const q = search.value.toLowerCase()

    return books.value
      .filter((book) => book.titulo?.toLowerCase().includes(q))
      .map((book) => ({ id: book.id, main: book.titulo, sub: book.autor }))
      .slice(0, 8)
  })

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
    booksFor,
    hiddenByPreference,
    searchSuggestions,
  }
}
