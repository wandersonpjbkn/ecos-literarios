import { useSeoMeta, useHead } from '@unhead/vue'
import { toValue } from 'vue'
import { useRoute } from 'vue-router'
import type { PageMetaOptions, MaybeRefOrGetter } from '@/types'

export function usePageMeta(options: MaybeRefOrGetter<PageMetaOptions>) {
  const route = useRoute()
  const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://ecosliterarios.com.br'
  const siteName = 'Ecos Literários'
  // A layout stays mounted across its sections, so the address has to follow the route too.
  const canonical = () => `${siteUrl}${route.path}`

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

  useHead({
    htmlAttrs: { lang: 'pt-BR' },
    link: [{ rel: 'canonical', href: canonical }],
  })
}
