import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import { useBooksStore } from '@/stores'

/** COPY.md: offline or with the server down the list stays readable; every way to add turns off together. */
export function useCanWrite() {
  const online = useOnline()
  const books = useBooksStore()
  return computed(() => online.value && !books.error)
}
