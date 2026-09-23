import { computed } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import { useBooksStore } from '@/stores'
import { useUtils } from '@/composables/useUtils'
import type { Book, FilterKey, Options } from '@/types'

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

const SHORT_BOOK_PAGES = 200

const SIZE_LABEL: Record<string, string> = {
  curto: 'Menos de 200 páginas',
  desconhecido: 'Sem número de páginas',
}

const SIZE_MATCH: Record<string, (book: Book) => boolean> = {
  curto: (book) => !!book.page_count && book.page_count < SHORT_BOOK_PAGES,
  desconhecido: (book) => !book.page_count,
}

const valuesOf = (book: Book, key: Exclude<FilterKey, 'tamanho'>): string[] => {
  if (key === 'subgeneros') return book.subgenerosArr ?? []
  const value = book[key]
  return value ? [value] : []
}

export function useFilters() {
  const route = useRoute()
  const router = useRouter()
  const { slugify } = useUtils()

  const books = computed(() => useBooksStore().books)

  const toSlug = (key: FilterKey, value: string) =>
    key === 'tamanho' ? (Object.keys(SIZE_LABEL).find((slug) => SIZE_LABEL[slug] === value) ?? '') : slugify(value)

  // ── Options derived from the loaded catalog ─────────────────────
  const options = computed(
    (): Options =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => [
          key,
          key === 'tamanho'
            ? Object.values(SIZE_LABEL)
            : [...new Set(books.value.flatMap((book) => valuesOf(book, key)))].sort((a, b) =>
                a.localeCompare(b, 'pt-BR'),
              ),
        ]),
      ) as Options,
  )

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
      ) as Options,
  )

  const pushQuery = (patch: LocationQueryRaw, replace = false) => {
    const next = { ...route.query, ...patch }
    Object.keys(next).forEach((param) => {
      if (next[param] === undefined || next[param] === '') delete next[param]
    })
    return replace ? router.replace({ query: next }) : router.push({ query: next })
  }

  const setSelected = (key: FilterKey, values: string[]) =>
    pushQuery({ [QUERY_PARAM[key]]: values.map((value) => toSlug(key, value)).join(',') || undefined })

  const toggle = (key: FilterKey, value: string) => {
    const current = selected.value[key]
    setSelected(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value])
  }

  const clearKey = (key: FilterKey) => setSelected(key, [])

  const clearAll = () =>
    pushQuery(Object.fromEntries([...FILTER_KEYS.map((key) => [QUERY_PARAM[key], undefined]), ['busca', undefined]]))

  const search = computed({
    get: () => String(route.query.busca ?? ''),
    set: (value: string) => pushQuery({ busca: value.trim() ? value : undefined }, true),
  })

  // ── Applied filters: OR inside a group, AND across groups ───────
  const filtered = computed(() => {
    let list = books.value

    const q = search.value.trim().toLowerCase()
    if (q) {
      list = list.filter((book) =>
        [book.titulo, book.autor, book.porque].some((field) => field?.toLowerCase().includes(q)),
      )
    }

    for (const key of FILTER_KEYS) {
      const chosen = selected.value[key]
      if (!chosen.length) continue
      if (key === 'tamanho') {
        const slugs = chosen.map((label) => toSlug(key, label))
        list = list.filter((book) => slugs.some((slug) => SIZE_MATCH[slug]?.(book)))
      } else {
        list = list.filter((book) => valuesOf(book, key).some((value) => chosen.includes(value)))
      }
    }

    return list
  })

  const searchSuggestions = computed(() => {
    if (!search.value.trim() || search.value.length < 2) return []

    const q = search.value.toLowerCase()

    return books.value
      .filter((book) => book.titulo?.toLowerCase().includes(q))
      .map((book) => ({ id: book.id, main: book.titulo, sub: book.autor }))
      .slice(0, 8)
  })

  return {
    search,
    options,
    selected,
    toggle,
    clearKey,
    clearAll,
    filtered,
    searchSuggestions,
  }
}
