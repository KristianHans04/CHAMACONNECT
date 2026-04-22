import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/Spinner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppLayout } from '@/components/layout/AppLayout';

import HomePage from '@/pages/public/HomePage';
import FeaturesPage from '@/pages/public/FeaturesPage';
import HowItWorksPage from '@/pages/public/HowItWorksPage';
import ContactPage from '@/pages/public/ContactPage';
import PrivacyPage from '@/pages/public/PrivacyPage';
import TermsPage from '@/pages/public/TermsPage';

import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';

import DashboardPage from '@/pages/app/dashboard/DashboardPage';
import ChamaListPage from '@/pages/app/chamas/ChamaListPage';
import ChamaCreatePage from '@/pages/app/chamas/ChamaCreatePage';
import ChamaDetailPage from '@/pages/app/chamas/ChamaDetailPage';
import ChamaEditPage from '@/pages/app/chamas/ChamaEditPage';
import MemberListPage from '@/pages/app/members/MemberListPage';
import MemberDetailPage from '@/pages/app/members/MemberDetailPage';
import ContributionListPage from '@/pages/app/contributions/ContributionListPage';
import ContributionCreatePage from '@/pages/app/contributions/ContributionCreatePage';
import ContributionDetailPage from '@/pages/app/contributions/ContributionDetailPage';
import ContributionEditPage from '@/pages/app/contributions/ContributionEditPage';
import OverduePage from '@/pages/app/overdue/OverduePage';
import StatementsListPage from '@/pages/app/statements/StatementsListPage';
import MemberStatementPage from '@/pages/app/statements/MemberStatementPage';
import AuditLogPage from '@/pages/app/audit/AuditLogPage';
import SettingsPage from '@/pages/app/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
      </Route>

      {/* Auth pages */}
      <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="verify-otp" element={<VerifyOtpPage />} />

      {/* Authenticated app */}
      <Route path="app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="chamas" element={<ChamaListPage />} />
        <Route path="chamas/new" element={<ChamaCreatePage />} />
        <Route path="chamas/:chamaId" element={<ChamaDetailPage />} />
        <Route path="chamas/:chamaId/edit" element={<ChamaEditPage />} />
        <Route path="chamas/:chamaId/members" element={<MemberListPage />} />
        <Route path="chamas/:chamaId/members/:memberId" element={<MemberDetailPage />} />
        <Route path="chamas/:chamaId/contributions" element={<ContributionListPage />} />
        <Route path="chamas/:chamaId/contributions/new" element={<ContributionCreatePage />} />
        <Route path="chamas/:chamaId/contributions/:contributionId" element={<ContributionDetailPage />} />
        <Route path="chamas/:chamaId/contributions/:contributionId/edit" element={<ContributionEditPage />} />
        <Route path="chamas/:chamaId/overdue" element={<OverduePage />} />
        <Route path="chamas/:chamaId/statements" element={<StatementsListPage />} />
        <Route path="chamas/:chamaId/statements/:memberId" element={<MemberStatementPage />} />
        <Route path="chamas/:chamaId/audit" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
