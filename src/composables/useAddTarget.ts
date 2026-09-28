import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { useAuthStore, usePermissionsStore } from '@/stores'

// The panel's list opens straight on the form with this query.
const FORM = { name: 'admin-books', query: { adicionar: '1' } } as const

/** Where "Adicionar" leads, or null when there is none to show: a Visitante is not invited to add (slice 8a). */
export function useAddTarget() {
  const auth = useAuthStore()
  const permissions = usePermissionsStore()
  return computed<RouteLocationRaw | null>(() => {
    // Signed out is almost always someone from the club on a new device: the login comes back to the form.
    if (!auth.isLoggedIn) return { name: 'auth-login', query: { voltar: '/admin/livros?adicionar=1' } }
    // Until users/me answers, the level stands in for the matrix, so an Editor is not turned away on a slow start.
    const mayCreate = permissions.mine ? permissions.can('books', 'create') : auth.isEditor
    return mayCreate ? FORM : null
  })
}
