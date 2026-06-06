import { MessageSquareText } from "lucide-react";

function FeedbackButton() {
  return (
    <button className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-800">
      <MessageSquareText size={17} />
      Feedback
    </button>
  );
}

export default FeedbackButton;
