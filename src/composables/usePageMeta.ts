import { useSeoMeta, useHead } from '@unhead/vue'
import { toValue } from 'vue'
import { useRoute } from 'vue-router'

import type { PageMetaOptions, MaybeRefOrGetter } from '@/types'

export function usePageMeta(options: MaybeRefOrGetter<PageMetaOptions>) {
  const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://ecosliterarios.com.br'
  const siteName = 'Ecos Literários'

  const route = useRoute()

  // A layout stays mounted across its sections, so the address has to follow the route too.
  const canonical = () => `${siteUrl}${route.path}`

  useHead({
    htmlAttrs: { lang: 'pt-BR' },
    link: [{ rel: 'canonical', href: canonical }],
  })

  // Getters, so a layout can hand in a title that follows the route (the panel's sections).
  const fullTitle = () => `${toValue(options).title} | ${siteName}`

  useSeoMeta({
    title: fullTitle,
    description: () => toValue(options).description,
    ogTitle: fullTitle,
    ogDescription: () => toValue(options).description,
    ogUrl: canonical,
    ogType: () => toValue(options).type ?? 'website',
    ogSiteName: siteName,
    twitterCard: 'summary',
  })
}
