import { ref } from 'vue'
import { defineStore } from 'pinia'

// Also the localStorage key: "Resetar cache" keeps it, the choice is the reader's, not cache.
export const PREFERENCES_STORE_ID = 'preferences'

export const usePreferencesStore = defineStore(
  PREFERENCES_STORE_ID,
  () => {
    const hiddenMidias = ref<string[]>([])

    const toggleMidia = (midia: string) => {
      hiddenMidias.value = hiddenMidias.value.includes(midia)
        ? hiddenMidias.value.filter((m) => m !== midia)
        : [...hiddenMidias.value, midia]
    }

    return { hiddenMidias, toggleMidia }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
