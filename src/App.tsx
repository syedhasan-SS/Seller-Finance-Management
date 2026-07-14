import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SellerProvider } from './contexts/SellerContext';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@components/Dashboard'));
const Orders = lazy(() => import('@components/Orders'));
const IncomeStatement = lazy(() => import('@components/IncomeStatement'));
const StatementDetail = lazy(() => import('@components/StatementDetail'));
const SellerProfileManager = lazy(() => import('@components/SellerProfileManager'));
const Home = lazy(() => import('@components/home/Home'));
const AdminProtectedRoute = lazy(() => import('@components/admin/AdminProtectedRoute'));
const AdminLayout = lazy(() => import('@components/admin/AdminLayout'));
const TasksManager = lazy(() => import('@components/admin/TasksManager'));
const AnnouncementsManager = lazy(() => import('@components/admin/AnnouncementsManager'));
const ArticlesManager = lazy(() => import('@components/admin/ArticlesManager'));
const ProgressView = lazy(() => import('@components/admin/ProgressView'));
const UniversityApp = lazy(() => import('@components/university/UniversityApp'));
const HelpCenterManager = lazy(() => import('@components/university/ManagerApp'));
const DevSession = lazy(() => import('@components/university/DevSession'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SellerProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/income-statement"
                element={
                  <ProtectedRoute>
                    <IncomeStatement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/income-statement/:statementId"
                element={
                  <ProtectedRoute>
                    <StatementDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tools/seller-profile-manager"
                element={
                  <ProtectedRoute>
                    <SellerProfileManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/tasks" replace />} />
                <Route path="tasks" element={<TasksManager />} />
                <Route path="announcements" element={<AnnouncementsManager />} />
                <Route path="articles" element={<ArticlesManager />} />
                <Route path="progress" element={<ProgressView />} />
              </Route>
              {/* Seller University mobile prototype — mock data, no auth (wireframes v3) */}
              <Route path="/university/*" element={<UniversityApp />} />
              {/* Help Center Manager — local pilot, content persists in-browser.
                  Same admin gate as /admin: owner/admin role required (pilot bypass: ?adminBypass=1). */}
              <Route
                path="/tools/help-center/*"
                element={
                  <AdminProtectedRoute>
                    <HelpCenterManager />
                  </AdminProtectedRoute>
                }
              />
              {/* Dev-only access checker — excluded from production builds */}
              {import.meta.env.DEV && <Route path="/dev/session" element={<DevSession />} />}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </SellerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
