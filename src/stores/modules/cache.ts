import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import type { Book } from '@/types'

export const useCacheStore = defineStore(
  'cache',
  () => {
    const cache = ref<Book[] | null>(null)
    const ts = ref<number>(0)
    const ttl = ref(5 * 60 * 1000)

    const isCacheValid = computed(() => {
      if (!cache.value || ts.value === 0) return false

      const now = Date.now()

      return now - ts.value < ttl.value
    })

    return {
      // state
      cache,
      ts,
      ttl,

      // getters
      isCacheValid,
    }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
