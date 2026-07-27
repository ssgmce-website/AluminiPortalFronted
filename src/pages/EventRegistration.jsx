import PageShell from "../components/PageShell";
import { EventRegistrationForm } from "../components/EventRegistrationForm";

function EventRegistration() {
  return (
    <PageShell eyebrow="Event" title="Event Registration">
      <div className="mt-6">
        <EventRegistrationForm />
      </div>
    </PageShell>
  );
}

export default EventRegistration;
