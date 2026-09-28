import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from '@/stores/modules/auth'

import type { Action, Resource } from '@/types'

// Not persisted: the matrix can change on the server, so each session reads it again (users/me).
export const usePermissionsStore = defineStore('permissions', () => {
  const mine = ref<Partial<Record<Resource, Action[]>> | null>(null)
  const failed = ref(false)
  // A free placeholder with this account's name (users/me): the add form asks "is this you?" first.
  const claimMatch = ref<string | null>(null)

  // Only hides what the server would refuse; the server still decides every request.
  const can = (resource: Resource, action: Action) => mine.value?.[resource]?.includes(action) ?? false

  // Mirrors the API: whoever may update books edits any book; the owner edits theirs through their own route.
  const canEditBook = (ownerUserId?: string) =>
    can('books', 'update') || (!!ownerUserId && ownerUserId === useAuthStore().user?._id)

  const set = (permissions: Partial<Record<Resource, Action[]>>, match: string | null = null) => {
    mine.value = permissions
    claimMatch.value = match
    failed.value = false
  }

  const clear = () => {
    mine.value = null
    claimMatch.value = null
    failed.value = false
  }

  const markFailed = () => {
    failed.value = true
  }

  return { mine, failed, claimMatch, can, canEditBook, set, clear, markFailed }
})
