import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { fetchExecutiveMembers } from '../services/alumniService';

function ExecutiveTeam() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveMembers()
      .then((dbMembers) => {
        if (dbMembers) {
          setExecutives(dbMembers);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dynamic executive members:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageShell eyebrow="About" title="Executive Team">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Table label */}
        <h3 className="text-lg font-bold text-blue-900">
          New Executive Team
        </h3>

        {/* Outer table border */}
        <div className="overflow-hidden rounded-xl border-2 border-blue-800 bg-white shadow-md">

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-800 text-white text-sm font-semibold uppercase tracking-wider">
                  <th className="border border-blue-600 px-6 py-4 text-left">
                    Member Info
                  </th>
                  <th className="border border-blue-600 px-6 py-4 text-left w-1/3">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="2" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/50">
                      Loading executive team members...
                    </td>
                  </tr>
                ) : executives.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/50">
                      No executive team members found.
                    </td>
                  </tr>
                ) : (
                  executives.map((member, idx) => (
                    <tr
                      key={member._id || idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}
                    >
                      {/* First column: Photo, Name, and Designation */}
                      <td className="border border-blue-100 px-6 py-4">
                        <div className="flex items-center gap-4 py-1">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover object-top border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-blue-700 text-white text-2xl font-bold border border-slate-100 shadow-sm shrink-0">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-blue-900 text-sm sm:text-base leading-tight">
                              {member.name}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                              {member.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Second column: Department */}
                      <td className="border border-blue-100 px-6 py-4 text-sm sm:text-base font-semibold text-slate-700">
                        {member.department}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default ExecutiveTeam;
