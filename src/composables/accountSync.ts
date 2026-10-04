import { useEventListener } from '@vueuse/core'
import { watch } from 'vue'

import { useAuthStore, usePermissionsStore } from '@/stores'

import type { FormatsSync } from '@/composables/formatsSync'
import { getMe } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

let retryLoad: (() => void) | null = null
let reloadNow: (() => Promise<void>) | null = null

export const retryAccountSync = () => retryLoad?.()

export const reloadAccount = () => reloadNow?.() ?? Promise.resolve()

export function startAccountSync(formats: FormatsSync): () => void {
  const auth = useAuthStore()
  const permissions = usePermissionsStore()

  const load = async (userId: string) => {
    try {
      const me = await getMe()
      if (auth.user?._id !== userId) return
      const { _id, email, name, role } = me.user
      auth.refreshUser({ _id, email, name, role })
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
