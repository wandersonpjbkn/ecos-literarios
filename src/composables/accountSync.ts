import { watch } from 'vue'
import { useEventListener } from '@vueuse/core'

import { getMe } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'
import type { FormatsSync } from '@/composables/formatsSync'
import { useAuthStore, usePermissionsStore } from '@/stores'

let retryLoad: (() => void) | null = null
let reloadNow: (() => Promise<void>) | null = null

/** Reads users/me again after a failed load ("Tentar de novo"). */
export const retryAccountSync = () => retryLoad?.()

/** Reads users/me again after something it reports changed (linking or unlinking a name). */
export const reloadAccount = () => reloadNow?.() ?? Promise.resolve()

/** One users/me read per session: the level's permissions to the store, the hidden formats to formatsSync. */
export function startAccountSync(formats: FormatsSync): () => void {
  const auth = useAuthStore()
  const permissions = usePermissionsStore()

  const load = async (userId: string) => {
    try {
      const me = await getMe()
      if (auth.user?._id !== userId) return
      permissions.set(me.permissions, me.claim_match ?? null)
      await formats.reconcile(userId, me.user.hidden_midias)
    } catch (err) {
      if (auth.user?._id !== userId) return
      permissions.markFailed()
      if (navigator.onLine) useErrorReporter().captureException(err, { context: 'accountSync.load' })
    }
  }

  const stopUser = watch(
    () => auth.user?._id,
    (userId) => {
      permissions.clear()
      if (userId) load(userId)
    },
    { immediate: true },
  )

  reloadNow = async () => {
    const userId = auth.user?._id
    if (userId) await load(userId)
  }
  retryLoad = () => {
    const userId = auth.user?._id
    if (userId && permissions.failed) load(userId)
  }
  // A read that failed is tried again when the connection is back, or when Supabase hands out a new token.
  const stopOnline = useEventListener(window, 'online', retryLoad)
  const stopToken = watch(() => auth.token, retryLoad)

  return () => {
    retryLoad = null
    reloadNow = null
    stopUser()
    stopOnline()
    stopToken()
  }
}
