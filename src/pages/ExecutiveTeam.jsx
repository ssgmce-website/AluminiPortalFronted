import PageShell from "../components/PageShell";

const executives = [
  {
    name: "Dr. Faculty Coordinator",
    designation: "Alumni Cell Coordinator",
    year: "2023-24",
    department: "Computer Science",
    photo: null,
  },
  {
    name: "Mr. Alumni President",
    designation: "President",
    year: "2023-24",
    department: "Mechanical Engineering",
    photo: null,
  },
  {
    name: "Ms. Alumni Secretary",
    designation: "Secretary",
    year: "2023-24",
    department: "Civil Engineering",
    photo: null,
  },
];

function ExecutiveTeam() {
  return (
    <PageShell eyebrow="About" title="Executive Team">
      <div>
        {/* Table label — outside the border */}
        <h3 className="mb-2 text-lg font-bold text-blue-900">
          New Executive Team
        </h3>

        {/* Outer table border */}
        <div className="overflow-hidden rounded-lg border-2 border-blue-800">
          {/* SSGMCE Board heading — inside the border, centered */}
          <div className="border-b-2 border-blue-800 bg-blue-50 py-3 text-center">
            <h4 className="text-xl font-extrabold uppercase tracking-widest text-blue-900">
              SSGMCE Board
            </h4>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="border border-blue-600 px-4 py-3 text-left text-sm font-semibold">
                    Name &amp; Designation
                  </th>
                  <th className="border border-blue-600 px-4 py-3 text-left text-sm font-semibold">
                    Year
                  </th>
                  <th className="border border-blue-600 px-4 py-3 text-left text-sm font-semibold">
                    Department
                  </th>
                  <th className="border border-blue-600 px-4 py-3 text-left text-sm font-semibold">
                    Photo
                  </th>
                </tr>
              </thead>
              <tbody>
                {executives.map((member, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                  >
                    <td className="border border-blue-100 px-4 py-3">
                      <p className="font-semibold text-blue-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.designation}</p>
                    </td>
                    <td className="border border-blue-100 px-4 py-3 text-sm text-slate-700">
                      {member.year}
                    </td>
                    <td className="border border-blue-100 px-4 py-3 text-sm text-slate-700">
                      {member.department}
                    </td>
                    <td className="border border-blue-100 px-4 py-3">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-24 w-24 rounded object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded bg-blue-700 text-2xl font-bold text-white">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default ExecutiveTeam;
