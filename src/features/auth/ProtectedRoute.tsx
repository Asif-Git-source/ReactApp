/**
 * PROTECTED ROUTES — React Router
 *
 * React Router v6 uses element-based routing. A ProtectedRoute is simply
 * a wrapper component that checks auth state and either renders children
 * or redirects to /login using the <Navigate> component.
 *
 * <Outlet /> renders the matched child route — used for nested layouts.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
