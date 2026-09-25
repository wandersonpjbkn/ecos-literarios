import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores'

/** Route behind "Adicionar" until the add panel exists: editors create books in the admin, members edit their own. */
export function useAddTarget() {
  const { isEditor } = storeToRefs(useAuthStore())
  return computed(() => (isEditor.value ? 'admin-books' : 'profile-books'))
}
