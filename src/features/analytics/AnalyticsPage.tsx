/**
 * ANALYTICS PAGE
 *
 * React.lazy + Suspense — Code Splitting:
 *
 * React.lazy(() => import('./AnalyticsCharts')) tells the bundler (Vite) to
 * put AnalyticsCharts (and recharts library) into a SEPARATE chunk that is
 * only downloaded when the user navigates to /analytics. This reduces the
 * initial bundle size significantly — users who never visit analytics don't
 * pay the recharts loading cost.
 *
 * <Suspense fallback={...}> renders the fallback while the lazy chunk loads.
 * React "suspends" rendering until the import() Promise resolves.
 *
 * Error Boundary: Wraps the charts so if recharts throws during render,
 * only this section shows an error — not the whole app.
 */
import { lazy, Suspense } from 'react';
import ErrorBoundary from '../../components/organisms/ErrorBoundary';

// Lazy-loaded — Vite splits this into its own JS chunk
const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={`bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse h-64 ${i >= 2 ? 'lg:col-span-2' : ''}`} />
    ))}
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Charts loaded via{' '}
          <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">React.lazy</code>
          {' '}+ code splitting. Wrapped in{' '}
          <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">ErrorBoundary</code>.
        </p>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<ChartSkeleton />}>
          <AnalyticsCharts />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
