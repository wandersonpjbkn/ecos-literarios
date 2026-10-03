import { useEventListener } from '@vueuse/core'
import { watch } from 'vue'

import { useAuthStore, usePreferencesStore } from '@/stores'

import { saveMyFormats } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

const SAVE_DELAY_MS = 800

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((item) => b.includes(item))

export type FormatsSync = {
  reconcile: (userId: string, server: string[] | undefined) => Promise<void>
  stop: () => void
}

export function startFormatsSync(): FormatsSync {
  const auth = useAuthStore()
  const preferences = usePreferencesStore()

  let timer: ReturnType<typeof setTimeout> | undefined
  let saving = false
  let saveAgain = false
  let adopting = false
  let accountList: string[] | null = null

  const report = (err: unknown, context: string) => {
    if (navigator.onLine) useErrorReporter().captureException(err, { context })
  }

  const adopt = (list: string[]) => {
    accountList = [...list]
    adopting = true
    preferences.hiddenFormats = [...list]
    preferences.owner = auth.user?._id ?? null
    adopting = false
  }

  const save = async () => {
    const pending = preferences.pending
    if (!pending || pending.userId !== auth.user?._id) return
    if (saving) {
      saveAgain = true
      return
    }
    saving = true
    try {
      const kept = (await saveMyFormats(pending.list)).hidden_midias ?? []
      if (auth.user?._id !== pending.userId) return
      accountList = [...kept]
      if (preferences.pending && sameList(preferences.pending.list, pending.list)) {
        preferences.pending = null
        adopt(kept)
      }
    } catch (err) {
      report(err, 'formatsSync.save')
    } finally {
      saving = false
      if (saveAgain) {
        saveAgain = false
        save()
      }
    }
  }

  const reconcile = async (userId: string, server: string[] | undefined) => {
    if (auth.user?._id !== userId) return
    if (preferences.pending?.userId === userId) return save()
    if (server === undefined) {
      if (preferences.owner !== userId) return adopt([])
      if (!preferences.hiddenFormats.length) return
      preferences.pending = { userId, list: [...preferences.hiddenFormats] }
      return save()
    }
    adopt(server)
  }

  const stopList = watch(
    () => preferences.hiddenFormats,
    (list) => {
      if (adopting) return
      const userId = auth.user?._id
      preferences.owner = userId ?? null
      if (!userId) return
      clearTimeout(timer)
      if (!saving && accountList && sameList(list, accountList)) {
        preferences.pending = null
        return
      }
      preferences.pending = { userId, list: [...list] }
      timer = setTimeout(save, SAVE_DELAY_MS)
    },
    { flush: 'sync' },
  )

  const stopSession = watch(
    () => auth.user?._id,
    () => {
      clearTimeout(timer)
      accountList = null
    },
  )

  const stopOnline = useEventListener(window, 'online', () => save())

  return {
    reconcile,
    stop: () => {
      clearTimeout(timer)
      stopList()
      stopSession()
      stopOnline()
    },
  }
}
