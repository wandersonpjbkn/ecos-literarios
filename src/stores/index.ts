import { useBooksStore } from '@/stores/modules/books'
import { useCacheStore } from '@/stores/modules/cache'
import { useAuthStore } from '@/stores/modules/auth'
import { usePreferencesStore, PREFERENCES_STORE_ID } from '@/stores/modules/preferences'
import { useReadingStore } from '@/stores/modules/reading'
import { usePermissionsStore } from '@/stores/modules/permissions'

export {
  useBooksStore,
  useCacheStore,
  useAuthStore,
  usePreferencesStore,
  PREFERENCES_STORE_ID,
  useReadingStore,
  usePermissionsStore,
}
