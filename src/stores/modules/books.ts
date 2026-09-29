import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { Book } from '@/types'

// The last catalog this device saw, shown at once and offline; catalogSync checks it against the API on every visit.
export const useBooksStore = defineStore(
  'books',
  () => {
    const books = ref<Book[]>([])
    // When that copy came from the API; "a lista de ontem" when the platform is down.
    const savedAt = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const size = computed(() => books.value.length)

    return {
      // state
      books,
      savedAt,
      loading,
      error,

      // getters
      size,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['books', 'savedAt'],
    },
  },
)
