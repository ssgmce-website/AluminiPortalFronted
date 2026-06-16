<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
=======
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import Newsroom from "./components/Newsroom";
import FeedbackButton from "./components/FeedbackButton";
import AlumniCell from "./pages/AlumniCell";
import ExecutiveTeam from "./pages/ExecutiveTeam";
import ActivityOrganized from "./pages/ActivityOrganized";
import DistinguishedAlumni from "./pages/DistinguishedAlumni";
import AnnualReport from "./pages/AnnualReport";
import Nomination from "./pages/Nomination";
import WithdrawalForm from "./pages/WithdrawalForm";
import Contribution from "./pages/Contribution";
import Newsletter from "./pages/Newsletter";
import Donation from "./pages/Donation";
import EventRegistration from "./pages/EventRegistration";
import EventGallery from "./pages/EventGallery";
import ContactPage from "./pages/ContactPage";
import { Footer } from "./pages/footer";

function Home() {
  return (
    <>
      <HeroSlider />
      <Newsroom />
    </>
  );
}

function NotFound() {
  return (
    <section className="mx-auto max-w-[1425px] rounded-lg border border-blue-100 bg-white p-8 shadow-lg shadow-blue-950/10">
      <h2 className="text-4xl font-bold text-blue-800">Page Not Found</h2>
      <p className="mt-4 text-slate-700">
        The page you are looking for does not exist.
      </p>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navbar />

      <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_48%,#e0f2fe_100%)] px-4 py-10 sm:px-6 lg:py-12">
        <Routes>
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
          <Route path="/event/gallery" element={<EventGallery />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <FeedbackButton />
    </div>
>>>>>>> fd763f8 (Add some modification in various pages)
  );
}

export default App;
