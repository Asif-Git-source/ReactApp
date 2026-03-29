/**
 * RTK QUERY — createApi
 *
 * RTK Query is Redux Toolkit's data-fetching solution. It auto-generates
 * React hooks (useGetStatsQuery, useGetActivityQuery) that handle:
 *   - Loading / error / success states automatically
 *   - Caching — same query reused across components without extra requests
 *   - Background refetching and cache invalidation via tags
 *
 * No need for separate useEffect + fetch + loading state boilerplate.
 */
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { StatsCard, ActivityItem, Task } from '../../types';

// Mock data — in a real app baseQuery would be fetchBaseQuery({ baseUrl })
const mockStats: StatsCard[] = [
  { label: 'Total Tasks', value: 124, change: 12, icon: '📋' },
  { label: 'In Progress', value: 38, change: -3, icon: '🔄' },
  { label: 'Completed', value: 76, change: 18, icon: '✅' },
  { label: 'Team Members', value: 12, change: 2, icon: '👥' },
];

const mockActivity: ActivityItem[] = [
  { id: '1', user: 'Alex J.', action: 'moved', target: 'Auth API integration', time: '2m ago' },
  { id: '2', user: 'Sam R.', action: 'completed', target: 'Dashboard redesign', time: '15m ago' },
  { id: '3', user: 'Jamie K.', action: 'created', target: 'Performance audit', time: '1h ago' },
  { id: '4', user: 'Alex J.', action: 'commented on', target: 'CI/CD pipeline fix', time: '2h ago' },
  { id: '5', user: 'Taylor M.', action: 'reviewed', target: 'Type refactor PR', time: '3h ago' },
];

export const mockAllTasks: Task[] = Array.from({ length: 200 }, (_, i) => ({
  id: `task-${i}`,
  title: `Task #${i + 1}: ${['Fix bug in', 'Implement', 'Review', 'Test', 'Deploy'][i % 5]} ${['auth module', 'dashboard', 'API layer', 'Redux slice', 'Kanban board'][i % 5]}`,
  description: 'Task description goes here',
  status: (['todo', 'in-progress', 'review', 'done'] as const)[i % 4],
  priority: (['low', 'medium', 'high'] as const)[i % 3],
  assignee: ['Alex J.', 'Sam R.', 'Jamie K.'][i % 3],
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  tag: ['frontend', 'backend', 'devops', 'design'][i % 4],
}));

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getStats: builder.query<StatsCard[], void>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 800)); // simulate latency
        return { data: mockStats };
      },
    }),
    getActivity: builder.query<ActivityItem[], void>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 600));
        return { data: mockActivity };
      },
    }),
  }),
});

export const { useGetStatsQuery, useGetActivityQuery } = dashboardApi;
