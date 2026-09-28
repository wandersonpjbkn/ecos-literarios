import { useOnline } from '@vueuse/core'
import { computed } from 'vue'

import { useBooksStore } from '@/stores'

/** COPY.md: offline or with the server down the list stays readable; every way to add turns off together. */
export function useCanWrite() {
  const books = useBooksStore()

  const online = useOnline()
  return computed(() => online.value && !books.error)
}
