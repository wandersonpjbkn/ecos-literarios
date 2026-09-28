import { defineStore } from 'pinia'
import { ref } from 'vue'

// Also the localStorage key: "Limpar os dados deste aparelho" keeps it, the choice is the reader's, not cache.
export const PREFERENCES_STORE_ID = 'preferences'

export const usePreferencesStore = defineStore(
  PREFERENCES_STORE_ID,
  () => {
    const hiddenMidias = ref<string[]>([])
    // Whose list this is: null when chosen signed out. Only the owner's own account ever receives it.
    const owner = ref<string | null>(null)
    // A change made here that has not reached that account yet (offline, server down), with the list itself.
    const pending = ref<{ userId: string; list: string[] } | null>(null)

    const toggleMidia = (midia: string) => {
      hiddenMidias.value = hiddenMidias.value.includes(midia)
        ? hiddenMidias.value.filter((m) => m !== midia)
        : [...hiddenMidias.value, midia]
    }

    return { hiddenMidias, owner, pending, toggleMidia }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
