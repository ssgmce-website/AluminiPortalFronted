import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SignIn } from '../pages/SignIn';
import { Dashboard } from '../pages/Dashboard';
import { AuthCallback } from '../pages/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import ScrollToTop from '../components/ScrollToTop';

// Public site UI (incoming changes)
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import Newsroom from '../components/Newsroom';
import FeedbackButton from '../components/FeedbackButton';
import { Footer } from '../pages/footer';
import AlumniCell from '../pages/AlumniCell';
import ExecutiveTeam from '../pages/ExecutiveTeam';
import ActivityOrganized from '../pages/ActivityOrganized';
import DistinguishedAlumni from '../pages/DistinguishedAlumni';
import AnnualReport from '../pages/AnnualReport';
import Nomination from '../pages/Nomination';
import WithdrawalForm from '../pages/WithdrawalForm';
import Contribution from '../pages/Contribution';
import Newsletter from '../pages/Newsletter';
import Donation from '../pages/Donation';
import EventRegistration from '../pages/EventRegistration';
import ContactPage from '../pages/ContactPage';

// Public-facing site layout (incoming UI: Header + Navbar + gradient main + Footer + Feedback)
const MainLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Header />
    <Navbar />
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#e0f2fe_100%)] px-4 py-10 sm:px-6 lg:py-12">
      <Outlet />
    </main>
    <Footer />
    <FeedbackButton />
  </div>
);

const Home = () => (
  <>
    <HeroSlider />
    <Newsroom />
  </>
);

export const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public pages (incoming UI) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about/alumni-cell" element={<AlumniCell />} />
          <Route path="/about/executive-team" element={<ExecutiveTeam />} />
          <Route path="/about/activity-organized" element={<ActivityOrganized />} />
          <Route path="/about/distinguished-alumni" element={<DistinguishedAlumni />} />
          <Route path="/about/annual-report" element={<AnnualReport />} />
          <Route path="/membership/nomination" element={<Nomination />} />
          <Route path="/membership/withdrawal-form" element={<WithdrawalForm />} />
          <Route path="/contribution" element={<Contribution />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/event/registration" element={<EventRegistration />} />
          <Route path="/contact" element={<ContactPage />} />
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
