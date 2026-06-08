import PageShell from "../components/PageShell";

function ActivityOrganized() {
  const activities = [
    "Alumni interaction sessions",
    "Guest lectures by alumni",
    "Career guidance programs",
    "Annual alumni meet",
  ];

  return (
    <PageShell eyebrow="About" title="Activity Organized">
      <ul className="grid gap-3 md:grid-cols-2">
        {activities.map((activity) => (
          <li className="rounded-md border border-blue-100 bg-slate-50 px-5 py-4 text-slate-700" key={activity}>
            {activity}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

export default ActivityOrganized;
