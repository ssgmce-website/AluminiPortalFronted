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
    <section className="mx-auto max-w-[1425px] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-950/15">
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

      <main className="min-h-screen bg-[linear-gradient(135deg,rgba(15,23,42,0.90),rgba(30,64,175,0.86)),radial-gradient(circle_at_18%_16%,rgba(147,197,253,0.35)_0_120px,transparent_121px),radial-gradient(circle_at_82%_72%,rgba(14,165,233,0.22)_0_160px,transparent_161px)] px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about/alumni-cell" element={<AlumniCell />} />
          <Route path="/about/executive-team" element={<ExecutiveTeam />} />
          <Route path="/about/activity-organized" element={<ActivityOrganized />} />
          <Route path="/about/distinguished-alumni" element={<DistinguishedAlumni />} />
          <Route path="/about/annual-report" element={<AnnualReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <FeedbackButton />
    </div>
  );
}

export default App;
