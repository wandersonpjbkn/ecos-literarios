import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import type { Book } from '@/types'

export const useBooksStore = defineStore(
  'books',
  () => {
    const books = ref<Book[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const size = computed(() => books.value.length)

    return {
      // state
      books,
      loading,
      error,

      // getters
      size,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['books'],
    },
  },
)
