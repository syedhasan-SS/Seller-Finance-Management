import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Gates /admin/* on role ≥ admin (or pilot bypass via ?adminBypass=1).
 * Pilot bypass is allowed because the pilot accepts any handle at /login and
 * doesn't have a real admin-user table yet.
 */
export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  const bypass = new URLSearchParams(location.search).get('adminBypass') === '1';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin && !bypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h2>
          <p className="text-gray-600 mb-4">
            The Admin Console is restricted to admin and owner roles.
          </p>
          <p className="text-xs text-gray-500">
            Pilot: append <code className="bg-gray-100 px-2 py-0.5 rounded">?adminBypass=1</code> to demo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
