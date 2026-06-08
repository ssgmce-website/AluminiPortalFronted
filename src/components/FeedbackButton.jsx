import { MessageSquareText } from "lucide-react";

function FeedbackButton() {
  return (
    <button className="fixed bottom-3 right-3 z-30 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-800 sm:bottom-4 sm:right-4 sm:px-5 sm:py-3">
      <MessageSquareText size={17} />
      <span className="hidden sm:inline">Feedback</span>
    </button>
  );
}

export default FeedbackButton;
