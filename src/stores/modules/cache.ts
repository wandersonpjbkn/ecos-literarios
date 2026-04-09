import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import type { Book } from '@/types'

export const useCacheStore = defineStore(
  'cache',
  () => {
    const cache = ref<Book[] | null>(null)
    const ts = ref<number>(0)
    const ttl = ref(24 * 60 * 60 * 1000) // 24h

    const isCacheValid = computed(() => {
      console.log(
        '%c is-cache-valid ',
        'background:bisque;color:black',
        `ts: [ ${ts.value} ] / `,
        `ttl: [ ${ttl.value} ] / `,
        `cache: `,
        cache.value,
      )

      if (!cache.value || ts.value === 0) return false

      const now = Date.now()

      return now - ts.value < ttl.value
    })

    const clear = () => {
      cache.value = null
      ts.value = 0
    }

    return {
      // state
      cache,
      ts,
      ttl,

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
