/**
 * VITE PRODUCTION CONFIG
 *
 * Features:
 *  - Path aliases (@, @components, @features, etc.) — shorter, refactor-safe imports
 *  - Manual chunking — splits vendor libraries into separate cacheable bundles
 *  - Source maps — required for Sentry to show original TypeScript in error traces
 *  - Sentry Vite plugin — uploads source maps to Sentry on production builds,
 *    then deletes them from dist/ so they aren't publicly served
 *  - Environment handling — loadEnv exposes all vars (including non-VITE_ ones)
 *    to the Vite config for use in plugins like sentryVitePlugin
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  /**
   * loadEnv(mode, cwd, prefix)
   *
   * Reads .env, .env.[mode], .env.local, .env.[mode].local files.
   * Empty string prefix '' loads ALL variables — including non-VITE_ ones.
   * This lets the Sentry plugin read SENTRY_AUTH_TOKEN (no VITE_ prefix)
   * without exposing it to the browser bundle.
   */
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),

      /**
       * sentryVitePlugin — production only
       *
       * Does two things during `vite build`:
       *   1. Injects a release ID into the bundle so Sentry can match
       *      minified stack frames to source maps
       *   2. Uploads source maps to Sentry, then deletes them from dist/
       *      so they're never publicly accessible
       *
       * Requires these env vars in CI (not in .env files — they're secrets):
       *   SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
       */
      ...(isProd
        ? sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          authToken: env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            // Upload everything in dist/ assets, then delete the map files
            // so they're not publicly served
            filesToDeleteAfterUpload: ['dist/assets/**/*.js.map'],
          },
          release: {
            name: env.VITE_APP_VERSION ?? '0.0.0',
          },
          telemetry: false, // opt out of Sentry's build analytics
        })
        : []),
    ],

    /**
     * Path aliases
     *
     * Defined here AND in tsconfig.app.json (paths) — both must stay in sync.
     * Vite uses these for bundling; TypeScript uses the tsconfig paths for
     * type checking and IDE autocomplete.
     *
     * Usage in any file:
     *   import { cn } from '@utils/cn'           instead of '../../../utils/cn'
     *   import Button from '@components/atoms/Button'
     *   import { store } from '@store'
     */
    resolve: {
      alias: {
        '@':            fileURLToPath(new URL('./src',            import.meta.url)),
        '@components':  fileURLToPath(new URL('./src/components', import.meta.url)),
        '@features':    fileURLToPath(new URL('./src/features',   import.meta.url)),
        '@store':       fileURLToPath(new URL('./src/store',      import.meta.url)),
        '@hooks':       fileURLToPath(new URL('./src/hooks',      import.meta.url)),
        '@utils':       fileURLToPath(new URL('./src/utils',      import.meta.url)),
        '@services':    fileURLToPath(new URL('./src/services',   import.meta.url)),
        '@app-types':   fileURLToPath(new URL('./src/types',      import.meta.url)),
      },
    },

    build: {
      /**
       * sourcemap: true
       *
       * Generates .js.map files alongside each bundle chunk.
       * Required for Sentry to display original TypeScript source in error reports.
       * The sentryVitePlugin uploads these maps then deletes them from dist/,
       * so the final deployed build has no publicly accessible source maps.
       */
      sourcemap: true,

      rollupOptions: {
        output: {
          /**
           * Manual chunks
           *
           * Without this, Rollup puts all vendor code into one large chunk.
           * Splitting by library lets the browser cache each vendor bundle
           * independently — upgrading React doesn't bust the Redux cache.
           *
           * Chunk naming strategy:
           *   vendor-*     Third-party libraries (long cache TTL)
           *   Feature pages stay as separate lazy-loaded chunks (handled by
           *   React.lazy in App.tsx — Rollup auto-splits them)
           *
           * Bundle sizes (approximate):
           *   vendor-react    ~120KB  React + ReactDOM
           *   vendor-router   ~25KB   React Router
           *   vendor-redux    ~55KB   RTK + react-redux
           *   vendor-forms    ~40KB   RHF + Zod + resolver
           *   vendor-charts   ~220KB  Recharts
           *   vendor-sentry   ~80KB   Sentry React SDK
           */
          manualChunks: {
            'vendor-react':   ['react', 'react-dom'],
            'vendor-router':  ['react-router-dom'],
            'vendor-redux':   ['@reduxjs/toolkit', 'react-redux'],
            'vendor-forms':   ['react-hook-form', 'zod', '@hookform/resolvers'],
            'vendor-charts':  ['recharts'],
            'vendor-sentry':  ['@sentry/react'],
          },
        },
      },
    },
  }
})
