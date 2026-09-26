import * as Sentry from '@sentry/vue'

import { ApiError } from '@/composables/apiError'
import type { AuthUser } from '@/types'

type ErrorContext = Record<string, unknown>

/**
 * Abstraction layer for error reporting (Dependency Inversion).
 * Components, composables, and stores depend on this composable —
 * not on Sentry directly. Swapping providers later means changing
 * this file only.
 */
// Searchable in Sentry: where it happened and, for API failures, the status and the route.
const tagsFor = (error: unknown, context?: ErrorContext): Record<string, string> => ({
  ...(context?.context ? { context: String(context.context) } : {}),
  ...(error instanceof ApiError ? { status: String(error.status), endpoint: error.endpoint } : {}),
})

export function useErrorReporter() {
  /**
   * Report a thrown error. Use in catch blocks and async failures
   * where the error indicates a real bug worth tracking.
   */
  function captureException(error: unknown, context?: ErrorContext): void {
    Sentry.captureException(error, {
      extra: context,
      tags: tagsFor(error, context),
      // Screen texts repeat on purpose ("Não deu pra salvar."); the place, not the text, tells issues apart.
      fingerprint: context?.context ? ['{{ default }}', String(context.context)] : undefined,
    })
  }

  /**
   * Report a custom event without an Error instance.
   * Use sparingly: every call consumes 1 event from the monthly quota.
   */
  function captureMessage(message: string, context?: ErrorContext): void {
    Sentry.captureMessage(message, context ? { extra: context } : undefined)
  }

  /**
   * Tag the current user. Errors after this call are linked to them,
   * which lets you see "users impacted" in the dashboard.
   * Pass null on logout.
   */
  function setUser(user: Pick<AuthUser, '_id' | 'email' | 'name'> | null): void {
    if (!user) {
      Sentry.setUser(null)
      return
    }

    Sentry.setUser({
      id: user._id,
      email: user.email,
      username: user.name,
    })
  }

  /**
   * Add a breadcrumb (free, attached to the next event).
   * Use generously: store actions, navigation, button clicks, API calls.
   */
  function addBreadcrumb(message: string, data?: ErrorContext): void {
    Sentry.addBreadcrumb({ message, data, level: 'info' })
  }

  return { captureException, captureMessage, setUser, addBreadcrumb }
}
