import { useEventListener } from '@vueuse/core'
import { watch } from 'vue'

import { useAuthStore, usePreferencesStore } from '@/stores'

import { saveMyFormats } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

// A few toggles in a row become one save instead of one write per click.
const SAVE_DELAY_MS = 800

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((item) => b.includes(item))

export type FormatsSync = {
  reconcile: (userId: string, server: string[] | undefined) => Promise<void>
  stop: () => void
}

/** Hidden formats kept in the account (rules in BACKEND.md §2); started once in App.vue, fed by accountSync. */
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
    preferences.hiddenMidias = [...list]
    preferences.owner = auth.user?._id ?? null
    adopting = false
  }

  // One save at a time: a change made while one is travelling goes right after it, never out of order.
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
      // Someone else signed in while this travelled: the answer is the previous account's, not theirs.
      if (auth.user?._id !== pending.userId) return
      // What the account holds now; a change made while this save travelled stays pending and goes next.
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
      // Another account's list, or one chosen signed out, would leak into this one: it starts empty instead.
      if (preferences.owner !== userId) return adopt([])
      if (!preferences.hiddenMidias.length) return
      preferences.pending = { userId, list: [...preferences.hiddenMidias] }
      return save()
    }
    adopt(server)
  }

  // Sync flush: the change is marked pending the moment it happens, so closing the tab inside the delay loses nothing.
  const stopList = watch(
    () => preferences.hiddenMidias,
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

  // Another account's pending change stays stored for it and is never pushed into this one.
  const stopSession = watch(
    () => auth.user?._id,
    () => {
      clearTimeout(timer)
      accountList = null
    },
  )

  // A save that failed offline stays pending; it goes as soon as the connection is back.
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
