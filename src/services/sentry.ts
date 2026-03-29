/**
 * SENTRY — Error Monitoring & Performance
 *
 * Centralises all Sentry setup in one place. Call initSentry() once,
 * before rendering the React tree, so every error is captured from the start.
 *
 * Architecture decisions:
 *
 *   - initSentry() is a no-op when VITE_SENTRY_DSN is empty, so local
 *     development works without any Sentry configuration.
 *
 *   - enabled: import.meta.env.PROD ensures events are only sent in
 *     production builds — no noise from dev hot-reload or staging tests
 *     unless you explicitly set the DSN in those environments.
 *
 *   - replaysOnErrorSampleRate: 1.0 means Sentry always records a session
 *     replay when an error occurs, even if the session wasn't sampled.
 *     This is the most useful Sentry feature for debugging hard-to-reproduce bugs.
 *
 *   - beforeSend filter drops ChunkLoadError events — these are caused by
 *     users with stale tabs after a deployment, not actual code bugs.
 *     They would otherwise flood the error dashboard.
 *
 * Usage — manual error capture anywhere in the app:
 *   import { Sentry } from '@services/sentry'
 *   Sentry.captureException(error)
 *   Sentry.captureMessage('Something unexpected happened', 'warning')
 *   Sentry.setUser({ id: user.id, email: user.email })
 *
 * Usage — add breadcrumbs (trail of events leading up to an error):
 *   Sentry.addBreadcrumb({ message: 'User clicked submit', category: 'ui' })
 */
import * as Sentry from '@sentry/react'

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  // Skip silently when DSN is not configured (local dev default)
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info(
        '[Sentry] Disabled — set VITE_SENTRY_DSN in .env to enable monitoring'
      )
    }
    return
  }

  Sentry.init({
    dsn,

    // Links errors in Sentry to a specific deployed version.
    // The release name must match what was used during source map upload.
    release: import.meta.env.VITE_APP_VERSION,

    // Separates events by environment in the Sentry dashboard
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'development',

    integrations: [
      /**
       * browserTracingIntegration
       * Automatically instruments:
       *   - Page loads and navigations (measures Time-to-Interactive)
       *   - fetch/XHR requests (measures API latency)
       * Results appear in Sentry's Performance tab
       */
      Sentry.browserTracingIntegration(),

      /**
       * replayIntegration
       * Records a video-like replay of the user's session.
       * maskAllText: false — shows text content in replays (set true for GDPR)
       * blockAllMedia: false — shows images in replays
       */
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Percentage of page loads that generate a performance trace (0.0 – 1.0)
    // 1.0 in dev, 0.2 in prod (set in .env.production)
    tracesSampleRate: Number(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.2
    ),

    // Percentage of sessions that get a full replay recorded
    replaysSessionSampleRate: Number(
      import.meta.env.VITE_SENTRY_REPLAYS_SAMPLE_RATE ?? 0.1
    ),

    // Always record a replay when an error occurs, even if the session wasn't sampled
    replaysOnErrorSampleRate: 1.0,

    // Send events in production and when explicitly enabled in other environments
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',

    beforeSend(event) {
      /**
       * Filter out known non-bug errors before they reach Sentry.
       * This keeps the error dashboard clean and reduces quota usage.
       *
       * ChunkLoadError: User has a stale tab open after a new deployment.
       * The old chunk URLs no longer exist. A page refresh fixes it.
       * Not a bug — happens to everyone on every deploy.
       */
      if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
        return null
      }
      return event
    },
  })
}

// Re-export the Sentry namespace so other modules can call
// Sentry.captureException, Sentry.setUser, etc. without depending on
// @sentry/react directly — all Sentry usage flows through this module.
export { Sentry }
