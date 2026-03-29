/// <reference types="vite/client" />

/**
 * Augments Vite's ImportMetaEnv with project-specific env vars.
 * All VITE_ prefixed vars defined in .env files should be listed here
 * so TypeScript knows their types and marks them as required/optional.
 *
 * Variables without VITE_ prefix are build-time only and are NOT accessible
 * via import.meta.env — they live only in vite.config.ts / CI environment.
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_SENTRY_DSN: string | undefined
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE: string
  readonly VITE_SENTRY_REPLAYS_SAMPLE_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
