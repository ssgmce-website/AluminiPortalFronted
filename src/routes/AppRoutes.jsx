import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { routeForProfile } from '../utils/authRoutes';
import ScrollToTop from '../components/ScrollToTop';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import FeedbackButton from '../components/FeedbackButton';
import PublicFeedback from '../components/PublicFeedback';
import { Footer } from '../pages/footer';

// ─── CODE-SPLIT: every page is a separate JS chunk ────────────────────────────
// Auth (small, load fast)
const SignIn = lazy(() => import('../pages/SignIn').then(m => ({ default: m.SignIn })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const AuthCallback = lazy(() => import('../pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const PendingApproval = lazy(() => import('../pages/PendingApproval').then(m => ({ default: m.PendingApproval })));

// Protected
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProfileCompletion = lazy(() => import('../pages/ProfileCompletion'));

// Admin (standalone auth — email + password, separate from Firebase)
const AdminLogin = lazy(() => import('../pages/AdminLogin').then(m => ({ default: m.AdminLogin })));

// Admin panels
const AdminOverview = lazy(() => import('../pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const MembersPanel = lazy(() => import('../pages/admin/MembersPanel').then(m => ({ default: m.MembersPanel })));
const EventsPanel = lazy(() => import('../pages/admin/EventsPanel').then(m => ({ default: m.EventsPanel })));
const EventsManagementPanel = lazy(() => import('../pages/admin/EventsManagementPanel').then(m => ({ default: m.EventsManagementPanel })));
const FeedbacksPanel = lazy(() => import('../pages/admin/FeedbacksPanel').then(m => ({ default: m.FeedbacksPanel })));
const FinancesPanel = lazy(() => import('../pages/admin/FinancesPanel').then(m => ({ default: m.FinancesPanel })));
const TravelPanel = lazy(() => import('../pages/admin/TravelPanel').then(m => ({ default: m.TravelPanel })));
const AnnualReportsPanel = lazy(() => import('../pages/admin/AnnualReportsPanel').then(m => ({ default: m.AnnualReportsPanel })));
const NewslettersPanel = lazy(() => import('../pages/admin/NewslettersPanel').then(m => ({ default: m.NewslettersPanel })));
const GalleryPanel = lazy(() => import('../pages/admin/GalleryPanel'));
const NewsPanel = lazy(() => import('../pages/admin/NewsPanel').then(m => ({ default: m.NewsPanel })));
const ExecutiveTeamPanel = lazy(() => import('../pages/admin/ExecutiveTeamPanel').then(m => ({ default: m.ExecutiveTeamPanel })));




// Public pages
const HomePage = lazy(() => import('../pages/HomePage'));
const AlumniCell = lazy(() => import('../pages/AlumniCell'));
const ExecutiveTeam = lazy(() => import('../pages/ExecutiveTeam'));
const ActivityOrganized = lazy(() => import('../pages/ActivityOrganized'));
const Contribution = lazy(() => import('../pages/Contribution'));
const DistinguishedAlumni = lazy(() => import('../components/DistinguishedAlumni'));
const Newsletter = lazy(() => import('../pages/Newsletter'));
const NewsDetail = lazy(() => import('../pages/NewsDetail'));
const AnnualReport = lazy(() => import('../pages/AnnualReport'));
const Donation = lazy(() => import('../pages/Donation'));
const AlumniFeedback = lazy(() => import('../pages/AlumniFeedback'));
const Gallery = lazy(() => import('../pages/Gallery'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const TermsOfUse = lazy(() => import('../pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));


// ─── LOADING FALLBACK ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 size={28} className="animate-spin text-blue-600" />
  </div>
);

// ─── LAYOUTS ─────────────────────────────────────────────────────────────────
const MainLayout = () => {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navbar />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!currentUser && <PublicFeedback />}
    </div>
  );
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────
export const AppRoutes = () => {
  const { currentUser, userProfile } = useAuth();
  const alreadyIn = currentUser && userProfile;
  const approvedAlumni =
    Boolean(currentUser) &&
    userProfile?.role === 'alumni' &&
    userProfile?.status === 'approved';
  const feedbackRoute = !currentUser ? (
    <Navigate to="/login" replace />
  ) : approvedAlumni ? (
    <Suspense fallback={<PageLoader />}><AlumniFeedback /></Suspense>
  ) : (
    <Navigate to={userProfile ? routeForProfile(userProfile) : '/login'} replace />
  );

  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Public site ───────────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about/alumni-cell" element={<AlumniCell />} />
          <Route path="/about/executive-team" element={<ExecutiveTeam />} />
          <Route path="/about/activity-organized" element={<ActivityOrganized />} />
          <Route path="/contribution" element={<Contribution />} />
          <Route path="/distinguished-alumni" element={<DistinguishedAlumni />} />
          <Route path="/annual-report" element={<AnnualReport />} />
          <Route path="/about/annual-report" element={<AnnualReport />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/news/:newsId" element={<NewsDetail />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/event/gallery" element={<Navigate to="/gallery" replace />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsOfUse />} />
        </Route>

        <Route path="/event/feedback" element={feedbackRoute} />
        <Route path="/feedback" element={<Navigate to="/event/feedback" replace />} />

        {/* ── Auth (no site chrome) ─────────────────────────────────────── */}
        <Route
          path="/login"
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

        {/* ── Redirect aliases ──────────────────────────────────────────── */}
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Navigate to="/login" replace />} />

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
          <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfileCompletion /></Suspense>} />
        </Route>

        {/* ── Admin login (standalone email + password, no site chrome) ──── */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />

        {/* ── Admin portal ──────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Suspense fallback={<PageLoader />}><AdminOverview /></Suspense>} />

          {/* Members */}
          <Route path="members" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="pending" /></Suspense>} />
          <Route path="members/approved" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="approved" /></Suspense>} />
          <Route path="members/rejected" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="rejected" /></Suspense>} />
          <Route path="members/dept-wise" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="dept-wise" /></Suspense>} />
          <Route path="members/distinguished" element={<Suspense fallback={<PageLoader />}><MembersPanel tab="distinguished" /></Suspense>} />

          {/* Events */}
          <Route path="events/current" element={<Suspense fallback={<PageLoader />}><EventsPanel tab="current" /></Suspense>} />
          <Route path="events/old" element={<Suspense fallback={<PageLoader />}><EventsPanel tab="old" /></Suspense>} />
          <Route path="events/manage" element={<Suspense fallback={<PageLoader />}><EventsManagementPanel /></Suspense>} />

          {/* Feedbacks */}
          <Route path="feedbacks/alumni" element={<Suspense fallback={<PageLoader />}><FeedbacksPanel tab="alumni" /></Suspense>} />
          <Route path="feedbacks/public" element={<Suspense fallback={<PageLoader />}><FeedbacksPanel tab="public" /></Suspense>} />


          {/* Finances */}
          <Route path="finances/contributions" element={<Suspense fallback={<PageLoader />}><FinancesPanel tab="contributions" /></Suspense>} />

          {/* Travel */}
          <Route path="travel/plans" element={<Suspense fallback={<PageLoader />}><TravelPanel tab="plans" /></Suspense>} />
          <Route path="travel/accommodation" element={<Suspense fallback={<PageLoader />}><TravelPanel tab="accommodation" /></Suspense>} />

          {/* Reports & Newsletters & Gallery */}
          <Route path="reports/annual" element={<Suspense fallback={<PageLoader />}><AnnualReportsPanel /></Suspense>} />
          <Route path="annual-reports" element={<Suspense fallback={<PageLoader />}><AnnualReportsPanel /></Suspense>} />
          <Route path="newsletters" element={<Suspense fallback={<PageLoader />}><NewslettersPanel /></Suspense>} />
          <Route path="reports/newsletters" element={<Suspense fallback={<PageLoader />}><NewslettersPanel /></Suspense>} />
          <Route path="gallery" element={<Suspense fallback={<PageLoader />}><GalleryPanel /></Suspense>} />
          <Route path="media/gallery" element={<Suspense fallback={<PageLoader />}><GalleryPanel /></Suspense>} />
          <Route path="news" element={<Suspense fallback={<PageLoader />}><NewsPanel /></Suspense>} />
          <Route path="executive-team" element={<Suspense fallback={<PageLoader />}><ExecutiveTeamPanel /></Suspense>} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
