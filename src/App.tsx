import { Router, Routes, Route, Navigate } from './lib/router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

import HomePage from './pages/HomePage';
import ExploreAdsPage from './pages/ExploreAdsPage';
import AdDetailPage from './pages/AdDetailPage';
import PackagesPage from './pages/PackagesPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import CitiesPage from './pages/CitiesPage';
import CityPage from './pages/CityPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

import ClientDashboard from './pages/client/ClientDashboard';
import CreateAdPage from './pages/client/CreateAdPage';
import MyAdsPage from './pages/client/MyAdsPage';
import SubmitPaymentPage from './pages/client/SubmitPaymentPage';
import AdStatusHistoryPage from './pages/client/AdStatusHistoryPage';

import ModeratorDashboard from './pages/moderator/ModeratorDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentQueuePage from './pages/admin/PaymentQueuePage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SystemHealthPage from './pages/admin/SystemHealthPage';
import UsersPage from './pages/admin/UsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

import PackageManagementPage from './pages/superadmin/PackageManagementPage';
import CategoriesManagementPage from './pages/superadmin/CategoriesManagementPage';
import CitiesManagementPage from './pages/superadmin/CitiesManagementPage';

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { session, user, loading } = useAuth();

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExploreAdsPage />} />
      <Route path="/ads/:slug" element={<AdDetailPage />} />
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:slug" element={<CategoryPage />} />
      <Route path="/cities" element={<CitiesPage />} />
      <Route path="/cities/:slug" element={<CityPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

      <Route path="/dashboard" element={<RequireAuth><ClientDashboard /></RequireAuth>} />
      <Route path="/dashboard/create-ad" element={<RequireAuth><CreateAdPage /></RequireAuth>} />
      <Route path="/dashboard/edit-ad/:id" element={<RequireAuth><CreateAdPage /></RequireAuth>} />
      <Route path="/dashboard/my-ads" element={<RequireAuth><MyAdsPage /></RequireAuth>} />
      <Route path="/dashboard/payment/:adId" element={<RequireAuth><SubmitPaymentPage /></RequireAuth>} />
      <Route path="/dashboard/ad-history/:id" element={<RequireAuth><AdStatusHistoryPage /></RequireAuth>} />

      <Route
        path="/moderator"
        element={<RequireAuth roles={['moderator', 'admin', 'super_admin']}><ModeratorDashboard /></RequireAuth>}
      />

      <Route
        path="/admin"
        element={<RequireAuth roles={['admin', 'super_admin']}><AdminDashboard /></RequireAuth>}
      />
      <Route
        path="/admin/payments"
        element={<RequireAuth roles={['admin', 'super_admin']}><PaymentQueuePage /></RequireAuth>}
      />
      <Route
        path="/admin/analytics"
        element={<RequireAuth roles={['admin', 'super_admin']}><AnalyticsPage /></RequireAuth>}
      />
      <Route
        path="/admin/health"
        element={<RequireAuth roles={['admin', 'super_admin']}><SystemHealthPage /></RequireAuth>}
      />
      <Route
        path="/admin/users"
        element={<RequireAuth roles={['admin', 'super_admin']}><UsersPage /></RequireAuth>}
      />
      <Route
        path="/admin/audit-logs"
        element={<RequireAuth roles={['admin', 'super_admin']}><AuditLogsPage /></RequireAuth>}
      />

      <Route
        path="/superadmin/packages"
        element={<RequireAuth roles={['super_admin']}><PackageManagementPage /></RequireAuth>}
      />
      <Route
        path="/superadmin/categories"
        element={<RequireAuth roles={['super_admin']}><CategoriesManagementPage /></RequireAuth>}
      />
      <Route
        path="/superadmin/cities"
        element={<RequireAuth roles={['super_admin']}><CitiesManagementPage /></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
