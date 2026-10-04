import { computed, type Ref } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'

export type SegmentOption<V extends string, T> = {
  value: V
  label: string
  query?: string
  test: (item: T) => boolean
  empty: { title: string; text?: string }
}

export function useSegments<V extends string, T>(options: SegmentOption<V, T>[], items: Ref<T[]>) {
  const fallback = options.find((option) => !option.query)!

  const route = useRoute()

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

  const inCurrent = computed(() => items.value.filter(current.value.test))

  const link = (value: V): RouteLocationRaw => {
    const query = { ...route.query }
    const option = options.find((item) => item.value === value)
    if (option?.query) query.mostrar = option.query
    else delete query.mostrar
    return { query }
  }

  return { current, counts, link, inCurrent }
}
