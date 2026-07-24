import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CalendarClock, History, Users, MapPin, Search,
  Filter, CheckCircle2, XCircle, Loader2, Download, Bus,
  Train, Car, Home, Clock, Phone, Mail, Award, Check
} from 'lucide-react';
import { fetchEventRegistrations, updateEventAttendance, listEventsAdmin } from '../../services/adminService';
import { fetchActiveEvent } from '../../services/alumniService';
import { search } from 'fast-fuzzy';

export const EventsPanel = ({ tab }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeEvent, setActiveEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accommFilter, setAccommFilter] = useState('all');
  const [travelFilter, setTravelFilter] = useState('all');

  // Updating feedback states
  const [updatingIds, setUpdatingIds] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Load data
  useEffect(() => {
    initPanel();
  }, [tab]);

  const initPanel = async () => {
    try {
      setLoading(true);
      setError('');
      if (tab === 'current') {
        const active = await fetchActiveEvent();
        if (active) {
          setActiveEvent(active);
          setSelectedYear(active.year);
          const data = await fetchEventRegistrations(active.year);
          setRegistrations(data.registrations || []);
        } else {
          setActiveEvent(null);
          setSelectedYear('');
          setRegistrations([]);
        }
      } else {
        const events = await listEventsAdmin();
        setAllEvents(events || []);
        const inactiveEvents = (events || []).filter(e => !e.isActive);
        if (inactiveEvents.length > 0) {
          setSelectedYear(inactiveEvents[0].year);
          const data = await fetchEventRegistrations(inactiveEvents[0].year);
          setRegistrations(data.registrations || []);
        } else {
          setSelectedYear('');
          setRegistrations([]);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initialize event registrations.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = async (year) => {
    setSelectedYear(year);
    try {
      setLoading(true);
      setError('');
      const data = await fetchEventRegistrations(year);
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load registration data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (regId, status) => {
    try {
      setUpdatingIds(prev => ({ ...prev, [regId]: true }));
      await updateEventAttendance(regId, status);

      // Update state local list
      setRegistrations(prev =>
        prev.map(r => r.id === regId ? { ...r, attendanceStatus: status } : r)
      );

      setSuccessMsg(`Attendance updated to ${status} successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update attendance.');
    } finally {
      setUpdatingIds(prev => ({ ...prev, [regId]: false }));
    }
  };

  // Filtered registrations using fast-fuzzy
  const filteredRegistrations = useMemo(() => {
    // 1. First apply structural dropdown filters
    const matchesStructural = registrations.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.attendanceStatus === statusFilter;
      const matchesAccomm = accommFilter === 'all' || r.accommodationRequired === accommFilter;
      const matchesTravel = travelFilter === 'all' || r.travelDetails?.travelMode === travelFilter;
      return matchesStatus && matchesAccomm && matchesTravel;
    });

    // 2. If no search query, return structural matches
    if (!searchQuery.trim()) {
      return matchesStructural;
    }

    // 3. Otherwise, use fast-fuzzy search with threshold 0.6
    return search(searchQuery, matchesStructural, {
      threshold: 1,
      keySelector: (r) => [
        r.alumnus?.name || '',
        r.alumnus?.email || '',
        r.alumnus?.alumniId || '',
        r.alumnus?.branch || '',
        r.alumnus?.yearOfPassout?.toString() || ''
      ]
    });
  }, [registrations, searchQuery, statusFilter, accommFilter, travelFilter]);

  // Export to Excel Helper
  const handleExport = () => {
    const rows = [
      ['Alumni ID', 'Name', 'Email', 'Contact', 'Branch', 'Batch', 'Accommodation', 'Family Count', 'Travel Mode', 'Arrival Date', 'Arrival Time', 'Departure Date', 'Departure Time', 'Attendance'],
      ...filteredRegistrations.map(r => [
        r.alumnus?.alumniId || 'N/A',
        r.alumnus?.name || 'N/A',
        r.alumnus?.email || 'N/A',
        r.alumnus?.contactNumber || 'N/A',
        r.alumnus?.branch || 'N/A',
        r.alumnus?.yearOfPassout || 'N/A',
        r.accommodationRequired || 'No',
        r.familyMembersCount || 0,
        r.travelDetails?.travelMode || 'N/A',
        r.travelDetails?.arrivalDate ? new Date(r.travelDetails.arrivalDate).toLocaleDateString('en-IN') : 'N/A',
        r.travelDetails?.arrivalTime || 'N/A',
        r.travelDetails?.departureDate ? new Date(r.travelDetails.departureDate).toLocaleDateString('en-IN') : 'N/A',
        r.travelDetails?.departureTime || 'N/A',
        r.attendanceStatus || 'registered'
      ])
    ];

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Event Registrations">
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meet-${selectedYear || 'Event'}-Registrations.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = registrations.length;
    const present = registrations.filter(r => r.attendanceStatus === 'present').length;
    const accomm = registrations.filter(r => r.accommodationRequired === 'Yes').length;
    const family = registrations.reduce((sum, r) => sum + (r.familyMembersCount || 0), 0);

    return { total, present, accomm, family };
  }, [registrations]);

  const Icon = tab === 'current' ? CalendarClock : History;

  if (tab === 'current' && !activeEvent && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto px-6">
        <Calendar size={48} className="text-[#0A3287] mb-4 opacity-75 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">No Active Event Configured</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
          There is no active Alumni Meet event in the system. Go to <strong>Manage Events</strong> to create one and activate it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Icon className="w-7 h-7 text-[#0A3287]" />
            {tab === 'current' ? `Alumni Meet ${selectedYear || ''} Registrations` : `Past Meet ${selectedYear || ''} Records`}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage registrations, view travel plans, accommodation requests, and track attendance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {tab === 'old' && allEvents.filter(e => !e.isActive).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Select Meet:</span>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-[#0A3287]/20 outline-none"
              >
                {allEvents.filter(e => !e.isActive).map(e => (
                  <option key={e._id} value={e.year}>{e.title} ({e.year})</option>
                ))}
              </select>
            </div>
          )}

          {registrations.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
            >
              <Download size={14} /> Export to Excel
            </button>
          )}
        </div>
      </div>

      {/* Analytics Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registered', value: stats.total, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', icon: Users },
          { label: 'Marked Present', value: stats.present, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
          { label: 'Accommodations', value: stats.accomm, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100', icon: Home },
          { label: 'Accompanying Guests', value: stats.family, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: Users }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${item.bg} flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{item.label}</p>
              <h3 className={`text-2xl font-black mt-1.5 ${item.color}`}>{loading ? '...' : item.value}</h3>
            </div>
            <item.icon className="w-8 h-8 opacity-20 text-slate-800" />
          </div>
        ))}
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <CheckCircle2 size={16} className="text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, branch..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Attendance</option>
              <option value="registered">Just Registered</option>
              <option value="present">Present (Checked-in)</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Travel Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Travel</span>
            <select
              value={travelFilter}
              onChange={e => setTravelFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Travel Modes</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
              <option value="Own Vehicle">Own Vehicle</option>
            </select>
          </div>

          {/* Accommodation Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Stay</span>
            <select
              value={accommFilter}
              onChange={e => setAccommFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Lodging</option>
              <option value="Yes">Needs Stay</option>
              <option value="No">No Stay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Data Loading View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Fetching meet registrations from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
          <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
          <Users size={40} className="mb-2 opacity-50" />
          <p className="text-sm font-semibold">No registrations match the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Alumnus</th>
                  <th className="px-6 py-4 text-left">Academic details</th>
                  <th className="px-6 py-4 text-left">Travel mode & Arrival</th>
                  <th className="px-6 py-4 text-center">Stay</th>
                  <th className="px-6 py-4 text-center">Family Count</th>
                  <th className="px-6 py-4 text-center">Attendance status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Alumnus Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-bold text-slate-800">{reg.alumnus?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400 font-semibold">{reg.alumnus?.alumniId || 'N/A'}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-0.5"><Mail size={11} /> {reg.alumnus?.email || 'N/A'}</span>
                            <span className="flex items-center gap-0.5"><Phone size={11} /> {reg.alumnus?.contactNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Academic Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-700">{reg.alumnus?.branch || 'N/A'}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">Batch: {reg.alumnus?.yearOfPassout || 'N/A'}</p>
                    </td>

                    {/* Travel Details Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">
                        {reg.travelDetails?.travelMode === 'Train' && <Train size={13} className="text-blue-600" />}
                        {reg.travelDetails?.travelMode === 'Bus' && <Bus size={13} className="text-indigo-600" />}
                        {reg.travelDetails?.travelMode === 'Own Vehicle' && <Car size={13} className="text-emerald-600" />}
                        <span>{reg.travelDetails?.travelMode || 'Not Provided'}</span>
                      </div>

                      {reg.travelDetails?.arrivalDate && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          Arr: {new Date(reg.travelDetails.arrivalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} @ {reg.travelDetails.arrivalTime || 'N/A'}
                        </p>
                      )}
                    </td>

                    {/* Stay (Accommodation) Column */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${reg.accommodationRequired === 'Yes'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {reg.accommodationRequired || 'No'}
                      </span>
                    </td>

                    {/* Family Count Column */}
                    <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-slate-700">
                      {reg.familyMembersCount || 0}
                    </td>

                    {/* Attendance Column with Toggle dropdown */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {updatingIds[reg.id] ? (
                          <Loader2 size={14} className="animate-spin text-slate-400" />
                        ) : null}

                        <select
                          value={reg.attendanceStatus || 'registered'}
                          disabled={updatingIds[reg.id]}
                          onChange={e => handleAttendanceChange(reg.id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border cursor-pointer focus:outline-none transition ${reg.attendanceStatus === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : reg.attendanceStatus === 'absent'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          <option value="registered">Registered</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Showing {filteredRegistrations.length} of {registrations.length} records</span>
            <span>Alumni Meet {selectedYear} Portal</span>
          </div>
        </div>
      )}
    </div>
  );
};
