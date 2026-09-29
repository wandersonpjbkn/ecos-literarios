import { useAuthStore } from '@/stores/modules/auth'
import { useBooksStore } from '@/stores/modules/books'
import { usePermissionsStore } from '@/stores/modules/permissions'
import { usePreferencesStore, PREFERENCES_STORE_ID } from '@/stores/modules/preferences'
import { useReadingStore } from '@/stores/modules/reading'

export { useBooksStore, useAuthStore, usePreferencesStore, PREFERENCES_STORE_ID, useReadingStore, usePermissionsStore }
