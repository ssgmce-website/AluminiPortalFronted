import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SignIn } from '../pages/SignIn';
import { Dashboard } from '../pages/Dashboard';
import { AuthCallback } from '../pages/AuthCallback';
import { HomePage } from '../pages/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { Header } from '../components/Header';
import { Navbar } from '../components/Navbar';
import { footer as Footer } from '../pages/footer';
import ScrollToTop from '../components/ScrollToTop';

// Public-facing site layout (Header + Navbar + Footer)
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Auth page — no site navigation */}
        <Route element={<AuthLayout />}>
          <Route
            path="/signin"
            element={currentUser ? <Navigate to="/dashboard" replace /> : <SignIn />}
          />
        </Route>

        {/* /login and /register are aliases for /signin (passwordless: sign-in creates the account) */}
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<Navigate to="/signin" replace />} />

        {/* OAuth / email-link callback — bare page, no layout */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
