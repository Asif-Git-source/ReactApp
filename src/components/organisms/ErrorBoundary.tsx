/**
 * ERROR BOUNDARY
 *
 * Error Boundaries are class components (the only remaining React use case
 * that requires a class) that catch JavaScript errors in their child tree,
 * log them, and show a fallback UI instead of crashing the whole app.
 *
 * They catch errors during: rendering, lifecycle methods, constructors.
 * They do NOT catch: event handlers, async code (use try/catch there),
 * server-side errors, or errors in the boundary itself.
 *
 * Sentry integration:
 *   componentDidCatch reports the error to Sentry with the React component
 *   stack as extra context. Sentry.withScope creates a temporary scope so
 *   the componentStack extra only appears on this specific event, not all
 *   future events from this session.
 *
 * getDerivedStateFromError: Update state to trigger fallback UI render.
 * componentDidCatch: Side effects — logging, Sentry reporting.
 */
import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Sentry } from '@services/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Triggers a re-render with the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Always log to console for local debugging
    console.error('[ErrorBoundary caught]', error, info.componentStack)

    /**
     * Report to Sentry with React component stack as context.
     *
     * withScope creates an isolated temporary scope — the componentStack
     * extra is attached only to this event, not to all future Sentry events
     * from this session.
     *
     * This is a no-op when Sentry is not initialized (no DSN configured),
     * so local development is unaffected.
     */
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', info.componentStack)
      scope.setTag('errorBoundary', 'true')
      Sentry.captureException(error)
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6 text-center">
            <span className="text-4xl mb-3">⚠️</span>
            <p className="text-red-700 dark:text-red-300 font-medium">
              Something went wrong
            </p>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
