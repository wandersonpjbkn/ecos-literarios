import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { Book } from '@/types'

export const useBooksStore = defineStore(
  'books',
  () => {
    const books = ref<Book[]>([])
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
      serializer: {
        serialize: JSON.stringify,
        deserialize: (raw) => {
          const state = JSON.parse(raw)
          state.books = (state.books ?? []).map(
            ({
              quem: legacyPerson,
              subgenerosArr: legacySubgenres,
              autor: legacyAuthor,
              ...book
            }: Record<string, unknown>) => ({
              ...book,
              authors: book.authors ?? (legacyAuthor ? [legacyAuthor] : []),
              person: book.person ?? legacyPerson,
              subgenreNames: book.subgenreNames ?? legacySubgenres ?? [],
            }),
          )
          return state
        },
      },
    },
  },
)
