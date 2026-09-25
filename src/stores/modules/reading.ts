import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ReadingEntry, ReadingStatus } from '@/types'

// Not persisted: the list belongs to the account and is reloaded from the API for whoever is signed in.
export const useReadingStore = defineStore('reading', () => {
  const statuses = ref<Record<string, ReadingStatus>>({})
  const loadedFor = ref<string | null>(null)

  const replaceAll = (userId: string, entries: ReadingEntry[]) => {
    statuses.value = Object.fromEntries(entries.map((entry) => [entry.book_id, entry.status]))
    loadedFor.value = userId
  }

  const set = (bookId: string, status: ReadingStatus | null) => {
    const next = { ...statuses.value }
    if (status) next[bookId] = status
    else delete next[bookId]
    statuses.value = next
  }

  const clear = () => {
    statuses.value = {}
    loadedFor.value = null
  }

  return { statuses, loadedFor, replaceAll, set, clear }
})
