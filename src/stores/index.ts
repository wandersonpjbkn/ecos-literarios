import { useBooksStore } from '@/stores/modules/books'
import { useCacheStore } from '@/stores/modules/cache'
import { useAuthStore } from '@/stores/modules/auth'
import { useBooksGridStore } from '@/stores/modules/catalog/booksGrid'
import { usePreferencesStore, PREFERENCES_STORE_ID } from '@/stores/modules/preferences'
import { useReadingStore } from '@/stores/modules/reading'

export {
  useBooksStore,
  useCacheStore,
  useAuthStore,
  useBooksGridStore,
  usePreferencesStore,
  PREFERENCES_STORE_ID,
  useReadingStore,
}
