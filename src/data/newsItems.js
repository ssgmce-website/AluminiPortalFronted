import newsletterPoster from "../assets/slide-session.jpeg";
import alumniMeetPoster from "../assets/gallery/AlumniMeet2026.jpeg";
import annualReportPoster from "../assets/slide-ceremony.jpeg";
import registrationPoster from "../assets/REGISITER.png";
import contributionPoster from "../assets/AlumniMeet.jpeg";
import feedbackPoster from "../assets/slide-meet.jpeg";

const newsItems = [
  {
    id: "newsletter-2026",
    title: "January 2026 Newsletter edition is now available",
    date: " 15 January 2026",
    image: newsletterPoster,
    summary:
      "Read the January 2026 alumni newsletter covering recent achievements, alumni stories, and campus updates.",
    details: [
      "The latest newsletter brings together association updates, student activities, alumni achievements, and institute highlights from the recent cycle.",
      "Alumni can use this edition to stay connected with SSGMCE events, contribution opportunities, and community announcements.",
    ],
    action: { label: "Open Newsletter", to: "/newsletter" },
  },
  {
    id: "alumni-meet-2026",
    title: "Grand Alumni Meet 2026 updates and highlights",
    date: " 15 January 2026",
    image: alumniMeetPoster,
    summary:
      "Highlights from the Grand Alumni Meet 2026 are available for alumni, faculty, and students.",
    details: [
      "The Grand Alumni Meet 2026 brought alumni from multiple batches back to the SSGMCE campus for interaction, networking, and celebration.",
      "The event included alumni-faculty interaction, student engagement sessions, and memories from campus life.",
    ],
    action: { label: "View Gallery", to: "/gallery" },
  },
  {
    id: "annual-report-2026",
    title: "Alumni Meet annual report for 2025-26 is being compiled",
    date: " 15 January 2026",
    image: annualReportPoster,
    summary:
      "The annual report will include events, alumni contributions, and activity summaries from the year.",
    details: [
      "The report documents alumni cell activities, association meetings, key events, contribution highlights, and future action points.",
      "Alumni members can review previous reports and follow the latest update once the new report is published.",
    ],
    action: { label: "Open Annual Report", to: "/about/annual-report" },
  },
  {
    id: "alumni-registration",
    title: "Alumni registration is open for all batches",
    date: " 15 January 2026",
    image: registrationPoster,
    summary:
      "Alumni from every batch can register on the portal and connect with the SSGMCE alumni community.",
    details: [
      "Registered alumni can keep their contact details updated and stay informed about alumni activities and campus initiatives.",
      "The portal helps the association build a verified alumni network for communication, events, and mentorship opportunities.",
    ],
    action: { label: "Register Now", to: "/register" },
  },
  {
    id: "alumni-contributions",
    title: "Alumni contribution drive supports institute development",
    date: " 15 January 2026",
    image: contributionPoster,
    summary:
      "Alumni can support student development, infrastructure, and association initiatives through contributions.",
    details: [
      "The contribution drive helps strengthen academic activities, student support, infrastructure needs, and alumni association programs.",
      "Every contribution is part of the larger effort to support the next generation of SSGMCE students.",
    ],
    action: { label: "Contribute", to: "/contribution" },
  },
  {
    id: "alumni-feedback",
    title: "Alumni feedback is invited for association activities",
    date: " 15 January 2026",
    image: feedbackPoster,
    summary:
      "Share feedback and suggestions to help improve future alumni programs and portal services.",
    details: [
      "Feedback from alumni helps the association improve annual meets, interaction sessions, student support activities, and communication.",
      "Approved alumni can submit their feedback through the portal feedback section.",
    ],
    action: { label: "Give Feedback", to: "/event/feedback" },
  },
];

export default newsItems;
