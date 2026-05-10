import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

interface SentrySetupOptions {
  app: App
  router: Router
  dsn: string
  release?: string
}

/**
 * Initializes Sentry for the Vue application.
 * Must be called once after createApp() and after app.use(router),
 * before app.mount().
 *
 * Free-tier conscious: tracing and replay are disabled to preserve
 * the 5k events/month quota for actual errors.
 */
export function setupSentry({ app, router, dsn, release }: SentrySetupOptions): void {
  // Skip in dev: noisy HMR errors would burn the quota.
  if (!dsn || import.meta.env.DEV) return

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.MODE,
    release,

    // Errors only on free tier.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Note: in @sentry/vue v10, `trackComponents` lives inside
    // `vueIntegration({ tracingOptions })` and only has effect with
    // tracing enabled. With tracesSampleRate: 0 it would do nothing,
    // so it's not configured here. The default Vue integration still
    // attaches component info to errors automatically.

    // LGPD-conscious: opt-in to PII (request headers, IP) only when needed.
    sendDefaultPii: false,

    integrations: [Sentry.browserTracingIntegration({ router })],

    /**
     * Quota guard: drop noise before it counts against the 5k/month budget.
     * Return null to discard, or the event to forward it.
     */
    beforeSend(event, hint) {
      const error = hint.originalException

      if (error instanceof Error) {
        // Drop browser-extension noise (very common in production).
        const stack = error.stack ?? ''
        if (/extension:\/\/|chrome-extension:\/\/|moz-extension:\/\//.test(stack)) {
          return null
        }

        // Drop fetch aborts (user navigated away mid-request, not a bug).
        if (error.name === 'AbortError') return null

        // Drop expected HTTP 4xx (client/permission errors, not bugs).
        // The app already surfaces these to the user via UI feedback.
        if (/HTTP 4\d\d/.test(error.message)) return null
      }

      // Drop the harmless ResizeObserver loop warning.
      if (event.message?.includes('ResizeObserver loop')) return null

      return event
    },

    // Cap breadcrumbs to keep payloads small.
    maxBreadcrumbs: 50,
  })
}
