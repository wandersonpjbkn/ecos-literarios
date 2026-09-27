import { computed, type Ref } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

export type SegmentOption<V extends string, T> = {
  value: V
  label: string
  // Absent only on the default segment, which leaves ?mostrar= out of the URL.
  query?: string
  test: (item: T) => boolean
  empty: { title: string; text?: string }
}

/** The chips over a list (?mostrar=): the current one, a count per chip, the link to each and its items. */
export function useSegments<V extends string, T>(options: SegmentOption<V, T>[], items: Ref<T[]>) {
  const route = useRoute()
  const fallback = options.find((option) => !option.query)!

  const current = computed(
    () => options.find((option) => option.query && option.query === route.query.mostrar) ?? fallback,
  )

  const counts = computed(
    () =>
      Object.fromEntries(options.map((option) => [option.value, items.value.filter(option.test).length])) as Record<
        V,
        number
      >,
  )

  const link = (value: V): RouteLocationRaw => {
    const query = { ...route.query }
    const option = options.find((item) => item.value === value)
    if (option?.query) query.mostrar = option.query
    else delete query.mostrar
    return { query }
  }

  const inCurrent = computed(() => items.value.filter(current.value.test))

  return { current, counts, link, inCurrent }
}
