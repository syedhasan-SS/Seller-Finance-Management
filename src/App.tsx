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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </SellerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
