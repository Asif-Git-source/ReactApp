/**
 * APP ROOT — React Router + Code Splitting
 *
 * All page-level routes are lazy-loaded. Each page becomes its own JS chunk
 * that Vite generates at build time. The browser only downloads a chunk
 * when the user navigates to that route for the first time.
 *
 * <Suspense> at the router level handles the loading state for all lazy pages.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './features/auth/AuthContext';
import { ThemeProvider } from './features/auth/ThemeContext';
import { ToastProvider } from './components/organisms/Toast';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Eagerly loaded (small, no heavy deps)
import LoginPage from './features/auth/LoginPage';

// Lazy-loaded pages — each becomes a separate JS bundle chunk
const DashboardPage  = lazy(() => import('./features/dashboard/DashboardPage'));
const BoardPage      = lazy(() => import('./features/board/BoardPage'));
const CreateTaskPage = lazy(() => import('./features/board/CreateTaskPage'));
const AnalyticsPage  = lazy(() => import('./features/analytics/AnalyticsPage'));
const TaskListPage   = lazy(() => import('./features/analytics/TaskListPage'));
const TeamPage       = lazy(() => import('./features/team/TeamPage'));
const SettingsPage   = lazy(() => import('./features/auth/SettingsPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading…</p>
    </div>
  </div>
);

export default function App() {
  return (
    // Redux Provider — makes store available to all components
    <Provider store={store}>
      {/* Theme Context — dark/light mode across the whole app */}
      <ThemeProvider>
        {/* Auth Context — user session state */}
        <AuthProvider>
          {/* Toast Portal Provider */}
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public route */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected routes — ProtectedRoute checks auth, renders Outlet or redirects */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/board" element={<BoardPage />} />
                      <Route path="/board/new" element={<CreateTaskPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/tasks" element={<TaskListPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
