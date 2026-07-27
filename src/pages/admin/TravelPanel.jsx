import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, Hotel, Calendar, Users, FileSpreadsheet, Clock,
  Train, Car, Plane, Bus, ChevronDown, Loader2, Phone, Mail,
  XCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { fetchEventRegistrations, listEventsAdmin } from '../../services/adminService';

const MODE_ICON = { Train: Train, Bus: Bus, 'Own Vehicle': Car };

const STATUS_COLOR = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-250',
  registered: 'bg-blue-100 text-blue-700 border-blue-250',
  absent: 'bg-rose-100 text-rose-700 border-rose-250',
};

export const TravelPanel = ({ tab }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initPanel();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadData();
    }
  }, [selectedYear]);

  const initPanel = async () => {
    try {
      setLoading(true);
      setError('');
      const events = await listEventsAdmin();
      setAllEvents(events || []);
      
      const active = (events || []).find(e => e.isActive);
      if (active) {
        setSelectedYear(active.year);
      } else if (events && events.length > 0) {
        setSelectedYear(events[0].year);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initialize travel dashboard.');
      console.error(err);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchEventRegistrations(selectedYear);
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch travel information.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter registrations that actually provided travel details
  const travelPlans = useMemo(() => {
    return registrations.filter(r => r.travelDetails && r.travelDetails.travelMode);
  }, [registrations]);

  // Filter registrations that require accommodation
  const accommodationRequests = useMemo(() => {
    return registrations.filter(r => r.accommodationRequired === 'Yes');
  }, [registrations]);

  // Statistics for Travel tab
  const travelStats = useMemo(() => {
    const total = travelPlans.length;
    const train = travelPlans.filter(p => p.travelDetails.travelMode === 'Train').length;
    const bus = travelPlans.filter(p => p.travelDetails.travelMode === 'Bus').length;
    const selfVehicle = travelPlans.filter(p => p.travelDetails.travelMode === 'Own Vehicle').length;

    return { total, train, bus, selfVehicle };
  }, [travelPlans]);

  // Statistics for Accommodation tab
  const accommStats = useMemo(() => {
    const total = accommodationRequests.length;
    const present = accommodationRequests.filter(r => r.attendanceStatus === 'present').length;
    const registered = accommodationRequests.filter(r => r.attendanceStatus === 'registered').length;

    return { total, present, registered };
  }, [accommodationRequests]);

  // Export Travel Plans to Excel
  const handleExportTravel = () => {
    const rows = [
      ['Name', 'Email', 'Contact', 'Branch', 'Batch', 'Travel Mode', 'Details', 'Arrival Date', 'Arrival Time', 'Departure Date', 'Departure Time', 'Stay Required'],
      ...travelPlans.map(p => {
        let details = 'N/A';
        if (p.travelDetails.travelMode === 'Train') {
          details = `Train: ${p.travelDetails.trainNameOrNumber || 'N/A'}, Coach: ${p.travelDetails.coachNumber || 'N/A'}`;
        } else if (p.travelDetails.travelMode === 'Bus') {
          details = `Bus: ${p.travelDetails.busName || 'N/A'}, Agency: ${p.travelDetails.busAgency || 'N/A'}`;
        } else if (p.travelDetails.travelMode === 'Own Vehicle') {
          details = `Vehicle No: ${p.travelDetails.vehicleNumber || 'N/A'}`;
        }
        return [
          p.alumnus?.name || 'N/A',
          p.alumnus?.email || 'N/A',
          p.alumnus?.contactNumber || 'N/A',
          p.alumnus?.branch || 'N/A',
          p.alumnus?.yearOfPassout || 'N/A',
          p.travelDetails.travelMode,
          details,
          p.travelDetails.arrivalDate ? new Date(p.travelDetails.arrivalDate).toLocaleDateString('en-IN') : 'N/A',
          p.travelDetails.arrivalTime || 'N/A',
          p.travelDetails.departureDate ? new Date(p.travelDetails.departureDate).toLocaleDateString('en-IN') : 'N/A',
          p.travelDetails.departureTime || 'N/A',
          p.accommodationRequired || 'No'
        ];
      })
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meet-${selectedYear}-Travel-Plans.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Accommodation list to Excel
  const handleExportAccommodation = () => {
    const rows = [
      ['Name', 'Email', 'Contact', 'Branch', 'Batch', 'Accompanying Family Count', 'Attendance Status'],
      ...accommodationRequests.map(a => [
        a.alumnus?.name || 'N/A',
        a.alumnus?.email || 'N/A',
        a.alumnus?.contactNumber || 'N/A',
        a.alumnus?.branch || 'N/A',
        a.alumnus?.yearOfPassout || 'N/A',
        a.familyMembersCount || 0,
        a.attendanceStatus || 'registered'
      ])
    ];

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Accommodations">
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meet-${selectedYear}-Accommodations.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {tab === 'plans' ? (
              <>
                <Navigation size={24} className="text-[#0A3287]" />
                Alumni Travel Plans
              </>
            ) : (
              <>
                <Hotel size={24} className="text-[#0A3287]" />
                Accommodation Requests
              </>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {tab === 'plans'
              ? 'Real travel modes, arrival dates, and vehicle/train details submitted by alumni.'
              : 'Alumni who requested lodging accommodation for the upcoming meet.'}
          </p>
        </div>

        {/* Year selector */}
        <div className="relative shrink-0">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
          >
            {allEvents.map(e => (
              <option key={e._id} value={e.year}>{e.title} ({e.year})</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Loading database information...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
          <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Plans Tab */}
          {tab === 'plans' && (
            <div className="space-y-6">
              {/* Stat Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Travel Submissions', value: travelStats.total, icon: Navigation, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-100' },
                  { label: 'Coming By Train', value: travelStats.train, icon: Train, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
                  { label: 'Coming By Bus', value: travelStats.bus, icon: Bus, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
                  { label: 'Coming By Personal Vehicle', value: travelStats.selfVehicle, icon: Car, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                ].map((s, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${s.bg} flex items-center gap-3 shadow-sm`}>
                    <s.icon size={20} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</p>
                      <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plans Table */}
              {travelPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                  <ShieldAlert size={36} className="mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No travel plans recorded for Meet {selectedYear}.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-700">
                      Alumni Meet {selectedYear} — {travelPlans.length} Submissions
                    </p>
                    <button
                      onClick={handleExportTravel}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet size={14} /> Export Travel Details
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left">Alumnus</th>
                          <th className="px-6 py-4 text-left">Travel Mode</th>
                          <th className="px-6 py-4 text-left">Details / Vehicle info</th>
                          <th className="px-6 py-4 text-left">Arrival</th>
                          <th className="px-6 py-4 text-left">Departure</th>
                          <th className="px-6 py-4 text-center">Stay Req.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {travelPlans.map((p, i) => {
                          const ModeIcon = MODE_ICON[p.travelDetails.travelMode] || Bus;
                          return (
                            <tr key={p.id || i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-bold text-slate-800">{p.alumnus?.name || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-semibold">
                                  <span>ID: {p.alumnus?.alumniId || 'N/A'}</span>
                                  <span>•</span>
                                  <span>{p.alumnus?.branch || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-700">
                                  <ModeIcon size={14} className="text-blue-700 shrink-0" />
                                  {p.travelDetails.travelMode}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                {p.travelDetails.travelMode === 'Train' && (
                                  <div>
                                    <p className="text-xs">Train: {p.travelDetails.trainNameOrNumber || 'N/A'}</p>
                                    <p className="text-[10px] text-slate-400">Coach: {p.travelDetails.coachNumber || 'N/A'}</p>
                                  </div>
                                )}
                                {p.travelDetails.travelMode === 'Bus' && (
                                  <div>
                                    <p className="text-xs">Bus: {p.travelDetails.busName || 'N/A'}</p>
                                    <p className="text-[10px] text-slate-400">Agency: {p.travelDetails.busAgency || 'N/A'}</p>
                                  </div>
                                )}
                                {p.travelDetails.travelMode === 'Own Vehicle' && (
                                  <span className="text-xs uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {p.travelDetails.vehicleNumber || 'N/A'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold text-xs">
                                {p.travelDetails.arrivalDate 
                                  ? `${new Date(p.travelDetails.arrivalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} @ ${p.travelDetails.arrivalTime || 'N/A'}`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold text-xs">
                                {p.travelDetails.departureDate 
                                  ? `${new Date(p.travelDetails.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} @ ${p.travelDetails.departureTime || 'N/A'}`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                                  p.accommodationRequired === 'Yes'
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  {p.accommodationRequired || 'No'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accommodation Tab */}
          {tab === 'accommodation' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Lodging Requests', value: accommStats.total, icon: Hotel, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
                  { label: 'Arriving Attendees', value: accommStats.present, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                  { label: 'Registered Awaiting Arrival', value: accommStats.registered, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' }
                ].map((s, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border ${s.bg} flex items-center justify-between shadow-sm`}>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</p>
                      <h3 className={`text-2xl font-black mt-1.5 ${s.color}`}>{s.value}</h3>
                    </div>
                    <s.icon className="w-8 h-8 opacity-20 text-slate-800" />
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Requests List</span>
                {accommodationRequests.length > 0 && (
                  <button
                    onClick={handleExportAccommodation}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    <FileSpreadsheet size={14} /> Export Accommodation List
                  </button>
                )}
              </div>

              {/* Accommodation Requests Cards */}
              {accommodationRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                  <Hotel size={40} className="mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No active lodging requests for Meet {selectedYear}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accommodationRequests.map((a, i) => (
                    <motion.div
                      key={a.id || i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{a.alumnus?.name || 'N/A'}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">ID: {a.alumnus?.alumniId || 'N/A'}</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${STATUS_COLOR[a.attendanceStatus || 'registered']}`}>
                          {a.attendanceStatus || 'registered'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Branch & Batch</span>
                          <span className="text-slate-700 font-bold block mt-0.5">{a.alumnus?.branch || 'N/A'} ({a.alumnus?.yearOfPassout || 'N/A'})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Family Accompanying</span>
                          <span className="text-slate-700 font-bold block mt-0.5">{a.familyMembersCount || 0} Member(s)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {a.alumnus?.email || 'N/A'}</div>
                        <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {a.alumnus?.contactNumber || 'N/A'}</div>
                        {a.travelDetails?.arrivalDate && (
                          <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-semibold mt-1">
                            <Clock size={12} />
                            Arr: {new Date(a.travelDetails.arrivalDate).toLocaleDateString('en-IN')} @ {a.travelDetails.arrivalTime || 'N/A'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
