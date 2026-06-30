import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarClock, History, Users, MapPin } from 'lucide-react';

const CURRENT_EVENTS = [
  { id: 1, name: 'Annual Alumni Meet 2025',  date: '2025-03-15', venue: 'SSGMCE Auditorium', registrations: 148, capacity: 200, status: 'open' },
  { id: 2, name: 'Tech Summit 2025',          date: '2025-04-22', venue: 'Computer Hall',      registrations: 74,  capacity: 100, status: 'open' },
  { id: 3, name: 'Alumni Sports Day 2025',    date: '2025-05-10', venue: 'Sports Ground',      registrations: 55,  capacity: 80,  status: 'open' },
];

const OLD_EVENTS = [
  { id: 4, name: 'Annual Alumni Meet 2024',     date: '2024-03-12', venue: 'SSGMCE Auditorium', registrations: 182, capacity: 200, status: 'closed' },
  { id: 5, name: 'Industry Interaction 2024',   date: '2024-07-18', venue: 'Seminar Hall',       registrations: 90,  capacity: 100, status: 'closed' },
  { id: 6, name: 'Annual Alumni Meet 2023',     date: '2023-03-10', venue: 'SSGMCE Auditorium', registrations: 167, capacity: 200, status: 'closed' },
  { id: 7, name: 'Grand Reunion 2022',          date: '2022-12-20', venue: 'City Hotel',         registrations: 123, capacity: 150, status: 'closed' },
];

const REGISTRATIONS = {
  1: [
    { id: 1, name: 'Rajesh Kumar',  email: 'rajesh@example.com',  batch: '2015', branch: 'Computer',     registeredAt: '2025-02-10' },
    { id: 2, name: 'Priya Sharma',  email: 'priya@example.com',   batch: '2018', branch: 'Electronics',  registeredAt: '2025-02-11' },
    { id: 3, name: 'Amit Patel',    email: 'amit@example.com',    batch: '2016', branch: 'Mechanical',   registeredAt: '2025-02-12' },
    { id: 4, name: 'Sneha Desai',   email: 'sneha@example.com',   batch: '2019', branch: 'Civil',        registeredAt: '2025-02-13' },
    { id: 5, name: 'Vikram Singh',  email: 'vikram@example.com',  batch: '2014', branch: 'Computer',     registeredAt: '2025-02-14' },
  ],
  4: [
    { id: 1, name: 'Suresh Mehta',  email: 'suresh@example.com',  batch: '2012', branch: 'Mechanical',   registeredAt: '2024-02-08' },
    { id: 2, name: 'Kavita Rao',    email: 'kavita@example.com',  batch: '2015', branch: 'Electronics',  registeredAt: '2024-02-09' },
    { id: 3, name: 'Deepak Nair',   email: 'deepak@example.com',  batch: '2010', branch: 'Civil',        registeredAt: '2024-02-10' },
  ],
};

function EventCard({ event, isSelected, onClick }) {
  const pct = Math.round((event.registrations / event.capacity) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(event)}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">{event.name}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${
          event.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {event.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(event.date).toLocaleDateString('en-IN')}</div>
        <div className="flex items-center gap-1.5"><MapPin size={13} /> {event.venue}</div>
        <div className="flex items-center gap-1.5"><Users size={13} /> {event.registrations} / {event.capacity} registered</div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">{pct}% capacity</p>
    </motion.div>
  );
}

function RegistrationsTable({ eventId }) {
  const rows = REGISTRATIONS[eventId] || [
    { id: 1, name: 'Sample Alumnus',  email: 'sample@example.com',  batch: '2015', branch: 'Computer',   registeredAt: '2025-01-01' },
    { id: 2, name: 'Another Alumnus', email: 'another@example.com', batch: '2016', branch: 'Mechanical', registeredAt: '2025-01-02' },
  ];
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            {['#', 'Name', 'Email', 'Branch', 'Batch', 'Registered On'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
              <td className="px-4 py-3 text-gray-500">{r.email}</td>
              <td className="px-4 py-3 text-gray-500">{r.branch}</td>
              <td className="px-4 py-3 text-gray-500">{r.batch}</td>
              <td className="px-4 py-3 text-gray-400">{new Date(r.registeredAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const EventsPanel = ({ tab }) => {
  const events = tab === 'current' ? CURRENT_EVENTS : OLD_EVENTS;
  const [selected, setSelected] = useState(null);
  const Icon = tab === 'current' ? CalendarClock : History;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icon size={24} className="text-blue-700" />
          {tab === 'current' ? 'Current Meet Registrations' : 'Old Meet Registrations'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {tab === 'current'
            ? 'Upcoming events and their live registration details.'
            : 'Past events and attendance records.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-6 text-sm">
        <span className="text-gray-500">{events.length} events</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{events.reduce((s, e) => s + e.registrations, 0)} total registrations</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">
          {Math.round(events.reduce((s, e) => s + e.registrations / e.capacity, 0) / (events.length || 1) * 100)}% avg. capacity
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selected?.id === event.id}
              onClick={e => setSelected(prev => prev?.id === e.id ? null : e)}
            />
          ))}
        </div>

        <div>
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-blue-700" />
                <h2 className="font-semibold text-gray-800">Registrations — {selected.name}</h2>
              </div>
              <RegistrationsTable eventId={selected.id} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <CalendarClock size={28} className="mb-2" />
              <p className="text-sm">Select an event to view registrations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
