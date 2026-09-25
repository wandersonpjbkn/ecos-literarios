import { useBooksStore } from '@/stores/modules/books'
import { useCacheStore } from '@/stores/modules/cache'
import { useAuthStore } from '@/stores/modules/auth'
import { useBooksGridStore } from '@/stores/modules/catalog/booksGrid'
import { usePreferencesStore, PREFERENCES_STORE_ID } from '@/stores/modules/preferences'

export { useBooksStore, useCacheStore, useAuthStore, useBooksGridStore, usePreferencesStore, PREFERENCES_STORE_ID }
