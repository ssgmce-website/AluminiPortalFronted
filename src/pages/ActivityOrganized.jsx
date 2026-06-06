function ActivityOrganized() {
  const activities = [
    "Alumni interaction sessions",
    "Guest lectures by alumni",
    "Career guidance programs",
    "Annual alumni meet",
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-950/15">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
        About
      </p>

      <h2 className="mt-2 text-4xl font-bold text-blue-800">
        Activity Organized
      </h2>

      <ul className="mt-6 space-y-3">
        {activities.map((activity) => (
          <li className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 text-slate-700" key={activity}>
            {activity}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityOrganized;
