import { computed } from 'vue'

import { SUPPORT_PHONE } from '@/data/config'

import { useAuthStore, usePermissionsStore } from '@/stores'

import { askGroupLink } from '@/composables/useAskGroup'

const supportLink = (message: string): string | null =>
  SUPPORT_PHONE ? `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}` : null

export const accessRequestLink = (email: string, what: string) =>
  supportLink(`Olá! Entrei no Ecos Literários com o e-mail ${email} e gostaria de pedir a liberação para ${what}.`)

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

export const reportLink = (message: string, bookPath: string) =>
  supportLink(`Olá! ${message} ${window.location.origin}${bookPath}`) ?? askGroupLink(message, bookPath)
