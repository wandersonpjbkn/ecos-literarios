import { defineStore } from 'pinia'
import { ref } from 'vue'

// Also the localStorage key: "Limpar os dados deste aparelho" keeps it, the choice is the reader's, not cache.
export const PREFERENCES_STORE_ID = 'preferences'

export const usePreferencesStore = defineStore(
  PREFERENCES_STORE_ID,
  () => {
    const hiddenFormats = ref<string[]>([])
    // Whose list this is: null when chosen signed out. Only the owner's own account ever receives it.
    const owner = ref<string | null>(null)
    // A change made here that has not reached that account yet (offline, server down), with the list itself.
    const pending = ref<{ userId: string; list: string[] } | null>(null)

    const toggleFormat = (format: string) => {
      hiddenFormats.value = hiddenFormats.value.includes(format)
        ? hiddenFormats.value.filter((hidden) => hidden !== format)
        : [...hiddenFormats.value, format]
    }

    return { hiddenFormats, owner, pending, toggleFormat }
  },
  {
    persist: {
      storage: localStorage,
      serializer: {
        serialize: JSON.stringify,
        // Saved before the rename, the hidden formats came under "hiddenMidias": the reader's choice is kept.
        deserialize: (raw) => {
          const { hiddenMidias: legacyHidden, ...state } = JSON.parse(raw)
          return legacyHidden && !state.hiddenFormats ? { ...state, hiddenFormats: legacyHidden } : state
        },
      },
    },
  },
)
