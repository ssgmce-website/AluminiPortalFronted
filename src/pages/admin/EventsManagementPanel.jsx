import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, Loader2, CheckCircle2, XCircle, Clock,
  FileText, CalendarDays, AlertTriangle, Check
} from 'lucide-react';
import { createEventAdmin, listEventsAdmin, activateEventAdmin } from '../../services/adminService';

export const EventsManagementPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listEventsAdmin();
      setEvents(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !year.trim() || !date) {
      setError('Title, Year, and Event Date are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createEventAdmin({
        title,
        year,
        date: new Date(date),
        registrationDeadline: deadline ? new Date(deadline) : undefined,
        isActive,
      });

      setSuccessMsg('Event created successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Reset form
      setTitle('');
      setYear('');
      setDate('');
      setDeadline('');
      setIsActive(false);
      setShowForm(false);

      // Reload
      await loadEvents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateEvent = async (eventId) => {
    try {
      setError('');
      await activateEventAdmin(eventId);
      setSuccessMsg('Event activated successfully. Other events have been set to inactive.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadEvents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to activate event.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#0A3287]" />
            Manage Events
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, view, and activate Alumni Meet events for registration.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-[#0A3287] hover:bg-[#0A3287]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus size={14} /> {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {/* Success/Error Alerts */}
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
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <AlertTriangle size={16} className="text-rose-600" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Event Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateEvent} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800">New Meet Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alumni Meet 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Event Year *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Event Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Registration Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#0A3287] focus:ring-[#0A3287] h-4.5 w-4.5"
                    />
                    <span className="text-sm font-bold text-slate-700">Set as Active Event (Starts registrations)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0A3287] hover:bg-[#0A3287]/90 text-white font-bold text-sm px-5 py-2 rounded-xl transition flex items-center gap-2 shadow-md"
                >
                  {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                  Create Event
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Table / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Fetching events from database...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
          <Calendar size={40} className="mb-2 opacity-50" />
          <p className="text-sm font-semibold">No events created yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Event Title</th>
                  <th className="px-6 py-4 text-left">Year</th>
                  <th className="px-6 py-4 text-left">Event Date</th>
                  <th className="px-6 py-4 text-left">Registration Deadline</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-800">{ev.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                      {ev.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} className="text-slate-400" />
                        {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {ev.registrationDeadline ? (
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-slate-400" />
                          {new Date(ev.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {ev.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {!ev.isActive ? (
                        <button
                          onClick={() => handleActivateEvent(ev._id)}
                          className="inline-flex items-center gap-1 text-xs font-bold bg-[#0A3287] hover:bg-[#0A3287]/90 text-white rounded-xl px-3 py-1.5 cursor-pointer shadow-sm transition"
                        >
                          <Check size={12} /> Activate
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                          <CheckCircle2 size={13} /> Currently Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
