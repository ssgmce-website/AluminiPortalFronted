import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { fetchActiveEvent, getMyEventRegistration } from '../services/alumniService';
import { useAuth } from '../contexts/AuthContext';

export const ActiveEventPopup = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    // Only show for logged-in alumni users
    if (!userProfile) return;

    // Skip only on admin and auth pages
    if (location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    const checkActiveEvent = async () => {
      try {
        const event = await fetchActiveEvent();
        if (!event) return;

        // Check if alumni is already registered — if check fails, assume not registered
        try {
          const regData = await getMyEventRegistration(event.year);
          if (regData && regData.registered) {
            return; // Already registered, no need to show popup
          }
        } catch (regErr) {
          // Registration check failed (401, network error, etc.) — show popup anyway
          console.warn('Could not check event registration status:', regErr);
        }

        setActiveEvent(event);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching active event:', err);
      }
    };

    // Small delay for smoother UX on page load
    const timer = setTimeout(checkActiveEvent, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, userProfile]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRegisterRedirect = () => {
    handleClose();
    navigate('/dashboard?tab=Events');
  };

  if (!isOpen || !activeEvent) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        {/* Overlay backdrop click */}
        <div className="absolute inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10"
        >
          {/* Top colored accent banner */}
          <div className="bg-gradient-to-r from-[#0A3287] via-[#1a4bb3] to-[#0A3287] px-6 py-8 text-white relative text-center">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition outline-none cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mx-auto w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm animate-bounce">
              <Sparkles className="text-amber-300 w-6 h-6 fill-amber-300/30" />
            </div>

            <h3 className="text-xl font-extrabold tracking-wide">
              {activeEvent.title}
            </h3>
            <p className="text-white/80 text-xs mt-1.5 font-medium uppercase tracking-wider">
              Registration is Now Open!
            </p>
          </div>

          {/* Details body */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-5 h-5 text-[#0A3287] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Event Date</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {new Date(activeEvent.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {activeEvent.registrationDeadline && (
                <div className="flex items-start gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 font-sans">Registration Deadline</h4>
                    <p className="text-amber-700 text-xs mt-0.5 font-sans font-semibold">
                      Please register before{' '}
                      {new Date(activeEvent.registrationDeadline).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-slate-500 text-sm text-center leading-relaxed">
              Join us back at the campus to reconnect, relive memories, and strengthen our alumni bond. Coordinate your travel and accommodation options by completing the form.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleClose}
                className="w-full sm:w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-2xl transition cursor-pointer"
              >
                Later
              </button>
              <button
                onClick={handleRegisterRedirect}
                className="w-full sm:w-2/3 py-3 bg-[#0A3287] hover:bg-blue-900 text-white font-bold text-sm rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Register Now</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
