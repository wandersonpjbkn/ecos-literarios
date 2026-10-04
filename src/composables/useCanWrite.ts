import { useOnline } from '@vueuse/core'
import { computed } from 'vue'

import { useBooksStore } from '@/stores'

export function useCanWrite() {
  const books = useBooksStore()

  const online = useOnline()
  return computed(() => online.value && !books.error)
}
