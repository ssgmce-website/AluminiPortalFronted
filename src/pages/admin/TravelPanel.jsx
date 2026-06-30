import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation, Hotel, Calendar, Users, FileSpreadsheet,
  Train, Car, Plane, Bus, ChevronDown,
} from 'lucide-react';

const TRAVEL_PLANS = [
  // ── Annual Meet 2026 ──────────────────────────────────────────────────────
  { id:  1, alumnus: 'Ravi Sharma',     email: 'ravi.s@ex.com',     from: 'Nagpur',     mode: 'Train',  arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  2, alumnus: 'Priya Joshi',     email: 'priya.j@ex.com',    from: 'Pune',       mode: 'Car',    arrival: '2025-12-24', departure: '2025-12-25', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  3, alumnus: 'Amit Desai',      email: 'amit.d@ex.com',     from: 'Mumbai',     mode: 'Flight', arrival: '2025-12-23', departure: '2025-12-27', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  4, alumnus: 'Sneha Kulkarni',  email: 'sneha.k@ex.com',    from: 'Delhi',      mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  5, alumnus: 'Vikram Rao',      email: 'vikram.r@ex.com',   from: 'Hyderabad',  mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-25', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  6, alumnus: 'Neha Tiwari',     email: 'neha.t@ex.com',     from: 'Bangalore',  mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  7, alumnus: 'Suresh Mehta',    email: 'suresh.m@ex.com',   from: 'Ahmedabad',  mode: 'Train',  arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  8, alumnus: 'Kavita Nair',     email: 'kavita.n@ex.com',   from: 'Chennai',    mode: 'Flight', arrival: '2025-12-23', departure: '2025-12-27', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id:  9, alumnus: 'Deepak Singh',    email: 'deepak.s@ex.com',   from: 'Kolkata',    mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id: 10, alumnus: 'Anita Patil',     email: 'anita.p@ex.com',    from: 'Wardha',     mode: 'Car',    arrival: '2025-12-25', departure: '2025-12-25', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2026' },
  { id: 11, alumnus: 'Rohit Gupta',     email: 'rohit.g@ex.com',    from: 'Bhopal',     mode: 'Train',  arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id: 12, alumnus: 'Meena Jain',      email: 'meena.j@ex.com',    from: 'Indore',     mode: 'Train',  arrival: '2025-12-24', departure: '2025-12-25', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2026' },
  { id: 13, alumnus: 'Arun Pillai',     email: 'arun.p@ex.com',     from: 'Kochi',      mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'pending',   event: 'Annual Meet 2026' },
  { id: 14, alumnus: 'Pooja Wagh',      email: 'pooja.w@ex.com',    from: 'Akola',      mode: 'Bus',    arrival: '2025-12-25', departure: '2025-12-25', needsAccommodation: false, status: 'pending',   event: 'Annual Meet 2026' },
  { id: 15, alumnus: 'Sanjay Bose',     email: 'sanjay.b@ex.com',   from: 'Kolkata',    mode: 'Flight', arrival: '2025-12-23', departure: '2025-12-27', needsAccommodation: true,  status: 'pending',   event: 'Annual Meet 2026' },
  { id: 16, alumnus: 'Lata Gaikwad',    email: 'lata.g@ex.com',     from: 'Yavatmal',   mode: 'Car',    arrival: '2025-12-25', departure: '2025-12-25', needsAccommodation: false, status: 'pending',   event: 'Annual Meet 2026' },
  { id: 17, alumnus: 'Nikhil Verma',    email: 'nikhil.v@ex.com',   from: 'Lucknow',    mode: 'Train',  arrival: '2025-12-24', departure: '2025-12-26', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2026' },
  { id: 18, alumnus: 'Shruti Thakur',   email: 'shruti.t@ex.com',   from: 'Chandigarh', mode: 'Flight', arrival: '2025-12-24', departure: '2025-12-25', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2026' },

  // ── Annual Meet 2025 ──────────────────────────────────────────────────────
  { id: 20, alumnus: 'Rajesh Kumar',    email: 'rajesh@ex.com',     from: 'Mumbai',     mode: 'Flight', arrival: '2025-03-14', departure: '2025-03-16', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2025' },
  { id: 21, alumnus: 'Priya Sharma',    email: 'priya@ex.com',      from: 'Pune',       mode: 'Train',  arrival: '2025-03-14', departure: '2025-03-16', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2025' },
  { id: 22, alumnus: 'Amit Patel',      email: 'amit@ex.com',       from: 'Nagpur',     mode: 'Car',    arrival: '2025-03-15', departure: '2025-03-15', needsAccommodation: false, status: 'confirmed', event: 'Annual Meet 2025' },
  { id: 23, alumnus: 'Sneha Desai',     email: 'sneha@ex.com',      from: 'Delhi',      mode: 'Flight', arrival: '2025-03-13', departure: '2025-03-17', needsAccommodation: true,  status: 'confirmed', event: 'Annual Meet 2025' },
  { id: 24, alumnus: 'Vikram Singh',    email: 'vikram@ex.com',     from: 'Hyderabad',  mode: 'Flight', arrival: '2025-03-14', departure: '2025-03-16', needsAccommodation: false, status: 'cancelled', event: 'Annual Meet 2025' },
];

const ACCOMMODATION = [
  { id: 1, alumnus: 'Amit Desai',     email: 'amit.d@ex.com',   hotel: 'Hotel Ashoka', checkIn: '2025-12-23', checkOut: '2025-12-27', type: 'Single', bookedBy: 'college', status: 'booked' },
  { id: 2, alumnus: 'Sneha Kulkarni', email: 'sneha.k@ex.com',  hotel: 'Hotel Ashoka', checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Double', bookedBy: 'college', status: 'booked' },
  { id: 3, alumnus: 'Neha Tiwari',    email: 'neha.t@ex.com',   hotel: 'Guest House',  checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'college', status: 'booked' },
  { id: 4, alumnus: 'Suresh Mehta',   email: 'suresh.m@ex.com', hotel: 'Hotel Raj',    checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'self',    status: 'booked' },
  { id: 5, alumnus: 'Kavita Nair',    email: 'kavita.n@ex.com', hotel: 'Hotel Ashoka', checkIn: '2025-12-23', checkOut: '2025-12-27', type: 'Double', bookedBy: 'college', status: 'booked' },
  { id: 6, alumnus: 'Deepak Singh',   email: 'deepak.s@ex.com', hotel: 'Guest House',  checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'college', status: 'booked' },
  { id: 7, alumnus: 'Rohit Gupta',    email: 'rohit.g@ex.com',  hotel: 'Hotel Raj',    checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'self',    status: 'requested' },
  { id: 8, alumnus: 'Arun Pillai',    email: 'arun.p@ex.com',   hotel: '—',            checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'college', status: 'requested' },
  { id: 9, alumnus: 'Sanjay Bose',    email: 'sanjay.b@ex.com', hotel: '—',            checkIn: '2025-12-23', checkOut: '2025-12-27', type: 'Double', bookedBy: 'college', status: 'requested' },
  { id:10, alumnus: 'Nikhil Verma',   email: 'nikhil.v@ex.com', hotel: 'Hotel Ashoka', checkIn: '2025-12-24', checkOut: '2025-12-26', type: 'Single', bookedBy: 'self',    status: 'booked' },
];

const MODE_ICON = { Train: Train, Car: Car, Flight: Plane, Bus: Bus };

const STATUS_COLOR = {
  confirmed:  'bg-emerald-100 text-emerald-700',
  pending:    'bg-amber-100 text-amber-700',
  cancelled:  'bg-red-100 text-red-700',
  booked:     'bg-emerald-100 text-emerald-700',
  requested:  'bg-blue-100 text-blue-700',
  'no-stay':  'bg-gray-100 text-gray-500',
};

const EVENTS = [...new Set(TRAVEL_PLANS.map(p => p.event))];

function exportToExcel(plans, eventName) {
  const rows = [
    ['Name', 'Email', 'From', 'Mode', 'Arrival', 'Departure', 'Accommodation', 'Status'],
    ...plans.map(p => [
      p.alumnus, p.email, p.from, p.mode,
      p.arrival, p.departure,
      p.needsAccommodation ? 'Yes' : 'No',
      p.status,
    ]),
  ];
  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Travel Plans">
    <Table>
      ${rows.map(row =>
        `<Row>${row.map(cell =>
          `<Cell><Data ss:Type="String">${String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`
        ).join('')}</Row>`
      ).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `travel-plans-${eventName.replace(/\s+/g, '-')}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatStrip({ plans }) {
  const arriving     = plans.filter(p => p.status !== 'cancelled').length;
  const needsAccomm  = plans.filter(p => p.status !== 'cancelled' && p.needsAccommodation).length;
  const confirmed    = plans.filter(p => p.status === 'confirmed').length;
  const pending      = plans.filter(p => p.status === 'pending').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Arriving',       value: arriving,    color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
        { label: 'Need Accommodation',   value: needsAccomm, color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-100' },
        { label: 'Confirmed',            value: confirmed,   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Pending',              value: pending,     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
      ].map(s => (
        <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
          <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export const TravelPanel = ({ tab }) => {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0]);

  const plans = useMemo(
    () => TRAVEL_PLANS.filter(p => p.event === selectedEvent),
    [selectedEvent],
  );

  if (tab === 'plans') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation size={24} className="text-blue-700" />
              Alumni Travel Plans
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Travel arrangements submitted by alumni for upcoming events.
            </p>
          </div>

          {/* Event selector */}
          <div className="relative shrink-0">
            <select
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
            >
              {EVENTS.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Summary strip */}
        <StatStrip plans={plans} />

        {/* Table + Export */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">
              {selectedEvent} — {plans.filter(p => p.status !== 'cancelled').length} alumni
            </p>
            <button
              onClick={() => exportToExcel(plans, selectedEvent)}
              className="flex items-center gap-1.5 text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
            >
              <FileSpreadsheet size={15} /> Export to Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  {['#', 'Name', 'From', 'Mode', 'Arrival', 'Accommodation', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plans.map((p, i) => {
                  const ModeIcon = MODE_ICON[p.mode] ?? Plane;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.alumnus}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.from}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <ModeIcon size={14} className="text-blue-500 shrink-0" />
                          {p.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(p.arrival).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        {p.needsAccommodation ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            <Hotel size={11} /> Yes
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Accommodation tab ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Hotel size={24} className="text-blue-700" /> Accommodation
        </h1>
        <p className="text-sm text-gray-500 mt-1">Hotel and guest house arrangements for alumni attending events.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total"     value={ACCOMMODATION.length} />
        <StatCard label="Booked"    value={ACCOMMODATION.filter(a => a.status === 'booked').length} />
        <StatCard label="Requested" value={ACCOMMODATION.filter(a => a.status === 'requested').length} />
      </div>

      <div className="space-y-3">
        {ACCOMMODATION.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{a.alumnus}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.type}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{a.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Hotel size={13} /> {a.hotel}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(a.checkIn).toLocaleDateString('en-IN')} → {new Date(a.checkOut).toLocaleDateString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-400">Booked by: {a.bookedBy}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
