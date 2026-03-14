import { useSeoMeta, useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

interface PageMetaOptions {
  title: string
  description?: string
  type?: 'website' | 'article'
}

export function usePageMeta(options: PageMetaOptions) {
  const route = useRoute()
  const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://ecosliterarios.com.br'
  const siteName = 'Ecos Literários'
  const canonical = `${siteUrl}${route.path}`

  const fullTitle = `${options.title} | ${siteName}`

  useSeoMeta({
    title: fullTitle,
    description: options.description,
    ogTitle: fullTitle,
    ogDescription: options.description,
    ogUrl: canonical,
    ogType: options.type ?? 'website',
    ogSiteName: siteName,
    twitterCard: 'summary',
  })

  useHead({
    htmlAttrs: { lang: 'pt-BR' },
    link: [{ rel: 'canonical', href: canonical }],
  })
}
