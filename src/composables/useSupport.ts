import { computed } from 'vue'

import { SUPPORT_PHONE } from '@/data/config'

import { useAuthStore, usePermissionsStore } from '@/stores'

import { askGroupLink } from '@/composables/useAskGroup'

/** WhatsApp to the support number with the message written; null when the build has no number, so nothing is offered. */
const supportLink = (message: string): string | null =>
  SUPPORT_PHONE ? `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}` : null

// The e-mail goes along: it is how the account is found in the club panel.
// `what` names the access asked for, so the admin knows which level to grant.
export const accessRequestLink = (email: string, what: string) =>
  supportLink(`Olá! Entrei no Ecos Literários com o e-mail ${email} e gostaria de pedir a liberação para ${what}.`)

// Waits for the matrix: while it loads, can() is false for everyone, Editors included.
export const useAccessRequest = () => {
  const auth = useAuthStore()
  const permissions = usePermissionsStore()
  return computed(() =>
    permissions.mine && !permissions.can('claim', 'update') && auth.user
      ? accessRequestLink(auth.user.email, 'vincular o meu nome do grupo')
      : null,
  )
}

export const helpLink = (email?: string | null) =>
  supportLink(`Olá! Preciso de ajuda com o Ecos Literários.${email ? ` Meu e-mail de acesso é ${email}.` : ''}`)

// A fix to a book goes to support; without a number, the reader picks the chat as before.
export const reportLink = (message: string, bookPath: string) =>
  supportLink(`Olá! ${message} ${window.location.origin}${bookPath}`) ?? askGroupLink(message, bookPath)
