import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

import { ApiError } from '@/composables/apiError'

interface SentrySetupOptions {
  app: App
  router: Router
  dsn: string
  release?: string
}

export function setupSentry({ app, router, dsn, release }: SentrySetupOptions): void {
  if (!dsn || import.meta.env.DEV) return

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.MODE,
    release,

    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    sendDefaultPii: false,

    integrations: [Sentry.browserTracingIntegration({ router })],

    beforeSend(event, hint) {
      const error = hint.originalException

      if (error instanceof Error) {
        const stack = error.stack ?? ''
        if (/extension:\/\/|chrome-extension:\/\/|moz-extension:\/\//.test(stack)) {
          return null
        }

        if (error.name === 'AbortError') return null

        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return null
        if (/HTTP 4\d\d/.test(error.message)) return null
      }

      if (event.message?.includes('ResizeObserver loop')) return null

      return event
    },

    maxBreadcrumbs: 50,
  })
}
