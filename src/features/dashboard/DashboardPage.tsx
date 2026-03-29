/**
 * DASHBOARD PAGE
 *
 * Demonstrates:
 *  - RTK Query hooks (useGetStatsQuery, useGetActivityQuery) for async data
 *  - useMemo to derive computed values without recalculating on every render
 *  - Suspense-like loading states from RTK Query
 */
import { useMemo } from 'react';
import { useGetStatsQuery, useGetActivityQuery } from './api';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/organisms/Toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: activity, isLoading: activityLoading } = useGetActivityQuery();

  /**
   * useMemo
   *
   * Memoizes the result of an expensive computation. The function only
   * re-runs when its dependencies change. Without useMemo, this calculation
   * would run on EVERY render — even when unrelated state changes.
   *
   * Rule: use it when the computation is expensive OR the result is passed
   * as a prop to a memoized child component.
   */
  const completionRate = useMemo(() => {
    if (!stats) return 0;
    const total = stats.find((s) => s.label === 'Total Tasks')?.value as number || 0;
    const done = stats.find((s) => s.label === 'Completed')?.value as number || 0;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [stats]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here's what's happening in your workspace
          </p>
        </div>
        <button
          onClick={() => showToast('Dashboard refreshed!', 'success')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse h-24" />
            ))
          : stats?.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Completion Progress (useMemo result) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Sprint Completion</h2>
          <span className="text-purple-600 font-bold text-lg">{completionRate}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Computed with <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">useMemo</code> — only recalculates when stats data changes
        </p>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {activityLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex gap-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-600 rounded w-1/4" />
                  </div>
                </div>
              ))
            : activity?.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                    {item.user.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{item.user}</span> {item.action}{' '}
                      <span className="font-medium text-purple-600 dark:text-purple-400">{item.target}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
