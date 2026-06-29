import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { routeForProfile } from '../utils/authRoutes';
import ScrollToTop from '../components/ScrollToTop';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import FeedbackButton from '../components/FeedbackButton';
import { Footer } from '../pages/footer';

// ─── CODE-SPLIT: every page is a separate JS chunk ────────────────────────────
// Auth (small, load fast)
const SignIn          = lazy(() => import('../pages/SignIn').then(m => ({ default: m.SignIn })));
const Register        = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const AuthCallback    = lazy(() => import('../pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const PendingApproval = lazy(() => import('../pages/PendingApproval').then(m => ({ default: m.PendingApproval })));

// Protected
const Dashboard    = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));

// Admin panels
const MembersPanel  = lazy(() => import('../pages/admin/MembersPanel').then(m => ({ default: m.MembersPanel })));
const EventsPanel   = lazy(() => import('../pages/admin/EventsPanel').then(m => ({ default: m.EventsPanel })));
const FinancesPanel = lazy(() => import('../pages/admin/FinancesPanel').then(m => ({ default: m.FinancesPanel })));
const TravelPanel   = lazy(() => import('../pages/admin/TravelPanel').then(m => ({ default: m.TravelPanel })));
const PostsPanel    = lazy(() => import('../pages/admin/PostsPanel').then(m => ({ default: m.PostsPanel })));

// Public pages
const HomePage           = lazy(() => import('../pages/HomePage'));
const AlumniCell         = lazy(() => import('../pages/AlumniCell'));
const ExecutiveTeam      = lazy(() => import('../pages/ExecutiveTeam'));
const ActivityOrganized  = lazy(() => import('../pages/ActivityOrganized'));
const DistinguishedAlumni = lazy(() => import('../pages/DistinguishedAlumni'));
const AnnualReport       = lazy(() => import('../pages/AnnualReport'));
const Nomination         = lazy(() => import('../pages/Nomination'));
const WithdrawalForm     = lazy(() => import('../pages/WithdrawalForm'));
const Contribution       = lazy(() => import('../pages/Contribution'));
const Newsletter         = lazy(() => import('../pages/Newsletter'));
const Donation           = lazy(() => import('../pages/Donation'));
const EventRegistration  = lazy(() => import('../pages/EventRegistration'));
const EventGallery       = lazy(() => import('../pages/EventGallery'));
const Gallery            = lazy(() => import('../pages/Gallery'));
const ContactPage        = lazy(() => import('../pages/ContactPage'));

// ─── LOADING FALLBACK ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 size={28} className="animate-spin text-blue-600" />
  </div>
);

// ─── LAYOUTS ─────────────────────────────────────────────────────────────────
const MainLayout = () => (
  <div className="min-h-screen bg-[#f7f2eb]">
    <Header />
    <Navbar />
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <FeedbackButton />
  </div>
);

// ─── ROUTES ───────────────────────────────────────────────────────────────────
export const AppRoutes = () => {
  const { currentUser, userProfile } = useAuth();
  const alreadyIn = currentUser && userProfile;

  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Public site ───────────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/"                          element={<HomePage />} />
          <Route path="/about/alumni-cell"         element={<AlumniCell />} />
          <Route path="/about/executive-team"      element={<ExecutiveTeam />} />
          <Route path="/about/activity-organized"  element={<ActivityOrganized />} />
          <Route path="/about/distinguished-alumni" element={<DistinguishedAlumni />} />
          <Route path="/about/annual-report"       element={<AnnualReport />} />
          <Route path="/membership/nomination"     element={<Nomination />} />
          <Route path="/membership/withdrawal-form" element={<WithdrawalForm />} />
          <Route path="/contribution"              element={<Contribution />} />
          <Route path="/newsletter"                element={<Newsletter />} />
          <Route path="/donation"                  element={<Donation />} />
          <Route path="/event/registration"        element={<EventRegistration />} />
          <Route path="/event/gallery"             element={<EventGallery />} />
          <Route path="/gallery"                   element={<Gallery />} />
          <Route path="/contact"                   element={<ContactPage />} />
        </Route>

        {/* ── Auth (no site chrome) ─────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route
            path="/sign-in"
            element={
              alreadyIn
                ? <Navigate to={routeForProfile(userProfile)} replace />
                : <Suspense fallback={<PageLoader />}><SignIn /></Suspense>
            }
          />
          <Route
            path="/register"
            element={
              alreadyIn
                ? <Navigate to={routeForProfile(userProfile)} replace />
                : <Suspense fallback={<PageLoader />}><Register /></Suspense>
            }
          />
        </Route>

        {/* ── Redirect aliases ──────────────────────────────────────────── */}
        <Route path="/signin"   element={<Navigate to="/sign-in" replace />} />
        <Route path="/Sign-in"  element={<Navigate to="/sign-in" replace />} />

        {/* ── OAuth / email-link callback — no layout ───────────────────── */}
        <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />

        {/* ── Awaiting admin approval ───────────────────────────────────── */}
        <Route path="/pending" element={<Suspense fallback={<PageLoader />}><PendingApproval /></Suspense>} />

        {/* ── Protected dashboard ───────────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        </Route>

        {/* ── Admin portal ──────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/members" replace />} />

          {/* Members */}
          <Route path="members"           element={<Suspense fallback={<PageLoader />}><MembersPanel tab="pending" /></Suspense>} />
          <Route path="members/approved"  element={<Suspense fallback={<PageLoader />}><MembersPanel tab="approved" /></Suspense>} />
          <Route path="members/rejected"  element={<Suspense fallback={<PageLoader />}><MembersPanel tab="rejected" /></Suspense>} />
          <Route path="members/dept-wise" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="dept-wise" /></Suspense>} />

          {/* Events */}
          <Route path="events/current" element={<Suspense fallback={<PageLoader />}><EventsPanel tab="current" /></Suspense>} />
          <Route path="events/old"     element={<Suspense fallback={<PageLoader />}><EventsPanel tab="old" /></Suspense>} />

          {/* Finances */}
          <Route path="finances/donations"     element={<Suspense fallback={<PageLoader />}><FinancesPanel tab="donations" /></Suspense>} />
          <Route path="finances/contributions" element={<Suspense fallback={<PageLoader />}><FinancesPanel tab="contributions" /></Suspense>} />

          {/* Travel */}
          <Route path="travel/plans"         element={<Suspense fallback={<PageLoader />}><TravelPanel tab="plans" /></Suspense>} />
          <Route path="travel/accommodation" element={<Suspense fallback={<PageLoader />}><TravelPanel tab="accommodation" /></Suspense>} />

          {/* Posts */}
          <Route path="posts/jobs"           element={<Suspense fallback={<PageLoader />}><PostsPanel tab="jobs" /></Suspense>} />
          <Route path="posts/activities"     element={<Suspense fallback={<PageLoader />}><PostsPanel tab="activities" /></Suspense>} />
          <Route path="posts/guest-lectures" element={<Suspense fallback={<PageLoader />}><PostsPanel tab="guest-lectures" /></Suspense>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
