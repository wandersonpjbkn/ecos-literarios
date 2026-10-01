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
      serializer: {
        serialize: JSON.stringify,
        // Saved before the renames ("quem", "subgenerosArr", a single "autor"): the copy shown offline keeps them.
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
