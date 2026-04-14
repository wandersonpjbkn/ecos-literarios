import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import type { Book } from '@/types'

export const useCacheStore = defineStore(
  'cache',
  () => {
    const cache = ref<Book[] | null>(null)
    const ts = ref<number>(0)
    const ttl = 7 * 24 * 60 * 60 * 1000 // 7d

    const isCacheValid = computed(() => {
      if (!cache.value || ts.value === 0) return false
      return Date.now() - ts.value < ttl
    })

    const clear = () => {
      cache.value = null
      ts.value = 0
    }

    return {
      // state
      cache,
      ts,

      // getters
      isCacheValid,

      // actions
      clear,
    }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
