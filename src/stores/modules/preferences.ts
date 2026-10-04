import { defineStore } from 'pinia'
import { ref } from 'vue'

export const PREFERENCES_STORE_ID = 'preferences'

export const usePreferencesStore = defineStore(
  PREFERENCES_STORE_ID,
  () => {
    const hiddenFormats = ref<string[]>([])
    const owner = ref<string | null>(null)
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
        deserialize: (raw) => {
          const { hiddenMidias: legacyHidden, ...state } = JSON.parse(raw)
          return legacyHidden && !state.hiddenFormats ? { ...state, hiddenFormats: legacyHidden } : state
        },
      },
    },
  },
)
