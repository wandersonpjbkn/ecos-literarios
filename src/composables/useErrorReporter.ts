import * as Sentry from '@sentry/vue'

import type { AuthUser } from '@/types'

import { ApiError } from '@/composables/apiError'

type ErrorContext = Record<string, unknown>

const tagsFor = (error: unknown, context?: ErrorContext): Record<string, string> => ({
  ...(context?.context ? { context: String(context.context) } : {}),
  ...(error instanceof ApiError ? { status: String(error.status), endpoint: error.endpoint } : {}),
})

export function useErrorReporter() {
  function captureException(error: unknown, context?: ErrorContext): void {
    Sentry.captureException(error, {
      extra: context,
      tags: tagsFor(error, context),
      fingerprint: context?.context ? ['{{ default }}', String(context.context)] : undefined,
    })
  }

  function captureMessage(message: string, context?: ErrorContext): void {
    Sentry.captureMessage(message, context ? { extra: context } : undefined)
  }

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

  function addBreadcrumb(message: string, data?: ErrorContext): void {
    Sentry.addBreadcrumb({ message, data, level: 'info' })
  }

  return { captureException, captureMessage, setUser, addBreadcrumb }
}
