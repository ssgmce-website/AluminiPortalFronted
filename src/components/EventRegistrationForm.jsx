import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar, Clock, Train, Bus, Car, Users,
  CheckCircle2, Edit3, AlertTriangle, AlertCircle,
  ArrowRight, ShieldCheck, Home, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  registerForEvent,
  getMyEventRegistration,
  updateEventRegistration
} from '../services/alumniService';

const EVENT_YEAR = '2026';
const EDIT_DEADLINE = new Date('2026-09-01T23:59:59');

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const periods = ['AM', 'PM'];

export const EventRegistrationForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registration, setRegistration] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if we can edit (current date <= Sept 1, 2026)
  const isEditable = new Date() <= EDIT_DEADLINE;

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      arrivalDate: null,
      arrivalHour: '',
      arrivalMinute: '',
      arrivalPeriod: '',
      departureDate: null,
      departureHour: '',
      departureMinute: '',
      departurePeriod: '',
      travelMode: '',
      busName: '',
      busAgency: '',
      trainNameOrNumber: '',
      coachNumber: '',
      vehicleNumber: '',
      accommodationRequired: 'No',
      familyMembersCount: 0,
    }
  });

  const selectedTravelMode = watch('travelMode');

  // Load registration status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyEventRegistration(EVENT_YEAR);
      if (data.registered && data.registration) {
        setRegistration(data.registration);
        // Prefill form defaults for editing
        const r = data.registration;
        const arrivalMatch = r.travelDetails?.arrivalTime?.match(/^(\d+):(\d+)\s+(AM|PM)$/);
        const departureMatch = r.travelDetails?.departureTime?.match(/^(\d+):(\d+)\s+(AM|PM)$/);

        reset({
          arrivalDate: r.travelDetails?.arrivalDate ? new Date(r.travelDetails.arrivalDate) : null,
          arrivalHour: arrivalMatch ? parseInt(arrivalMatch[1], 10) : '',
          arrivalMinute: arrivalMatch ? arrivalMatch[2] : '',
          arrivalPeriod: arrivalMatch ? arrivalMatch[3] : '',
          departureDate: r.travelDetails?.departureDate ? new Date(r.travelDetails.departureDate) : null,
          departureHour: departureMatch ? parseInt(departureMatch[1], 10) : '',
          departureMinute: departureMatch ? departureMatch[2] : '',
          departurePeriod: departureMatch ? departureMatch[3] : '',
          travelMode: r.travelDetails?.travelMode || '',
          busName: r.travelDetails?.busName || '',
          busAgency: r.travelDetails?.busAgency || '',
          trainNameOrNumber: r.travelDetails?.trainNameOrNumber || '',
          coachNumber: r.travelDetails?.coachNumber || '',
          vehicleNumber: r.travelDetails?.vehicleNumber || '',
          accommodationRequired: r.accommodationRequired || 'No',
          familyMembersCount: r.familyMembersCount || 0,
        });
      }
    } catch (err) {
      setError('Failed to fetch event registration status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const arrivalTimeStr = values.arrivalHour && values.arrivalMinute && values.arrivalPeriod
        ? `${values.arrivalHour}:${values.arrivalMinute} ${values.arrivalPeriod}`
        : '';
      const departureTimeStr = values.departureHour && values.departureMinute && values.departurePeriod
        ? `${values.departureHour}:${values.departureMinute} ${values.departurePeriod}`
        : '';

      const payload = {
        year: EVENT_YEAR,
        accommodationRequired: values.accommodationRequired,
        familyMembersCount: Number(values.familyMembersCount),
        travelDetails: {
          arrivalDate: values.arrivalDate,
          arrivalTime: arrivalTimeStr,
          departureDate: values.departureDate,
          departureTime: departureTimeStr,
          travelMode: values.travelMode,
          busName: values.travelMode === 'Bus' ? values.busName : undefined,
          busAgency: values.travelMode === 'Bus' ? values.busAgency : undefined,
          trainNameOrNumber: values.travelMode === 'Train' ? values.trainNameOrNumber : undefined,
          coachNumber: values.travelMode === 'Train' ? values.coachNumber : undefined,
          vehicleNumber: values.travelMode === 'Own Vehicle' ? values.vehicleNumber : undefined,
        }
      };

      let updatedReg;
      if (isEditing) {
        updatedReg = await updateEventRegistration(EVENT_YEAR, payload);
        setSuccessMsg('Registration details updated successfully.');
      } else {
        updatedReg = await registerForEvent(payload);
        setSuccessMsg('You have successfully registered for the Alumni Meet!');
      }

      setRegistration(updatedReg);
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please check your connection.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
        <p className="text-gray-500 font-medium">Checking event registration status...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-2">
      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-xl text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW REGISTRATION DETAILS */}
      {registration && !isEditing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0A3287] to-[#1e4eb8] px-8 py-6 text-white relative">
            <div className="absolute right-6 top-6 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              Alumni Meet {EVENT_YEAR}
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Registered Successfully
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Your travel and accommodation arrangements for the meet are confirmed.
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Premium Pass Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4">
              <div
                id="alumni-pass-card"
                className="w-full max-w-[320px] bg-gradient-to-b from-[#0A3287] via-[#0D3BB0] to-[#041a4a] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border-2 border-amber-400/30 flex flex-col justify-between min-h-[460px] text-center"
              >
                {/* Decorative gradients */}
                <div className="absolute -top-10 -left-10 w-28 h-28 bg-white/5 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-400/5 rounded-full blur-xl animate-pulse" />

                {/* Badge Top Header */}
                <div className="relative pb-3 border-b border-white/10">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Official Entry Pass</div>
                  <h4 className="text-sm font-black tracking-wide mt-0.5">SSGMCE SHEGAON</h4>
                </div>

                {/* QR Code Container */}
                <div className="my-6 flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-inner relative z-10 w-44 h-44 mx-auto border border-slate-100">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      window.location.origin + '/event/scan-attendance/' + registration._id
                    )}`}
                    alt="Scan Attendance QR"
                    className="w-36 h-36 object-contain"
                  />
                </div>

                {/* Alumnus info */}
                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-black tracking-wide">{registration.user?.profile?.name || 'Alumnus'}</h3>
                  <p className="text-[11px] font-bold text-amber-400/90 tracking-wider uppercase">
                    ID: {registration.user?.alumniId || 'N/A'}
                  </p>

                  <div className="pt-2 flex justify-center items-center gap-3 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                    <div>{registration.user?.academic?.branch || 'N/A'}</div>
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                    <div>Batch {registration.user?.academic?.yearOfPassout || 'N/A'}</div>
                  </div>

                  {/* Alumini Image  */}
                  {/* <div className="mt-6 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] uppercase font-black tracking-wider text-white/50">
                    <img src={registration.user?.profile?.profilePhoto || 'N/A'} alt="Alumini" className="w-36 h-36 object-contain" />
                  </div> */}
                </div>

                {/* Badge Bottom Footer */}
                <div className="mt-6 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] uppercase font-black tracking-wider text-white/50">
                  <span>Alumni Meet 2026</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    {registration.attendanceStatus === 'present' ? 'Present' : 'Verified'}
                  </span>
                </div>
              </div>

              {/* Print / Save Pass Button */}
              <button
                onClick={() => {
                  const cardElement = document.getElementById("alumni-pass-card");
                  if (cardElement) {
                    const printContent = cardElement.outerHTML;
                    const originalContent = document.body.innerHTML;
                    document.body.innerHTML = `
                      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                        ${printContent}
                      </div>
                    `;
                    window.print();
                    window.location.reload();
                  }
                }}
                className="w-full max-w-[320px] inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition border border-slate-200/50 cursor-pointer shadow-sm"
              >
                Print Entry Pass
              </button>
            </div>

            {/* Right side: Detailed Information */}
            <div className="lg:col-span-7 space-y-6">
              {/* Travel Details Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Travel Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Travel Mode</p>
                    <div className="flex items-center gap-2 mt-1">
                      {registration.travelDetails?.travelMode === 'Train' && <Train className="w-4 h-4 text-blue-600" />}
                      {registration.travelDetails?.travelMode === 'Bus' && <Bus className="w-4 h-4 text-indigo-600" />}
                      {registration.travelDetails?.travelMode === 'Own Vehicle' && <Car className="w-4 h-4 text-emerald-600" />}
                      <span className="text-sm font-semibold text-slate-800">{registration.travelDetails?.travelMode || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium">Arrival Details</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {registration.travelDetails?.arrivalDate
                        ? new Date(registration.travelDetails.arrivalDate).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {registration.travelDetails?.arrivalTime || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium">Departure Details</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {registration.travelDetails?.departureDate
                        ? new Date(registration.travelDetails.departureDate).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {registration.travelDetails?.departureTime || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Travel Specifics (Conditional) */}
              {registration.travelDetails?.travelMode && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Vehicles & Identification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {registration.travelDetails.travelMode === 'Train' && (
                      <>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Train Name / Number</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{registration.travelDetails.trainNameOrNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Coach Number</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{registration.travelDetails.coachNumber || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    {registration.travelDetails.travelMode === 'Bus' && (
                      <>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Bus Name</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{registration.travelDetails.busName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Bus Agency</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{registration.travelDetails.busAgency || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    {registration.travelDetails.travelMode === 'Own Vehicle' && (
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Vehicle Number</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 uppercase">{registration.travelDetails.vehicleNumber || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Accommodation & Guests */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4" /> Guest & Room Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Accommodation Required</p>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${registration.accommodationRequired === 'Yes'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                      {registration.accommodationRequired || 'No'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium">Family Members Accompanying</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        {registration.familyMembersCount || 0} Member(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions and Deadlines */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100/60 border border-slate-200/50 rounded-xl px-4 py-2 text-xs font-medium text-slate-500">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    {isEditable
                      ? 'Registration is editable up to Sept 1, 2026.'
                      : 'Editing is locked (Sept 1, 2026 deadline passed).'
                    }
                  </span>
                </div>

                {isEditable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0A3287] hover:bg-blue-900 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* RENDER REGISTER / EDIT REGISTRATION FORM */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-md p-8"
        >
          <div className="text-center max-w-md mx-auto mb-8">
            <h1 className="text-2xl font-extrabold text-[#0A3287]">
              {isEditing ? 'Edit Event Registration' : 'Alumni Meet Registration'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Please provide your travel and guest information so we can coordinate transport and accommodation.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Arrival Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                1. Arrival Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Arrival Date *</label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="arrivalDate"
                      rules={{
                        required: 'Arrival date is required',
                        validate: (val) => {
                          const departure = getValues('departureDate');
                          if (departure && val) {
                            const arr = new Date(val);
                            const dep = new Date(departure);
                            const diffMs = dep.getTime() - arr.getTime();
                            if (diffMs < 0) {
                              return 'Arrival date cannot be after departure date';
                            }
                            const diffDays = diffMs / (1000 * 60 * 60 * 24);
                            if (diffDays > 3) {
                              return 'Stay duration cannot exceed 3 days';
                            }
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => {
                            field.onChange(date);
                            if (getValues('departureDate')) {
                              trigger('departureDate');
                            }
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="dd/mm/yyyy"
                          className="w-full border border-[#cbd5e1] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                          wrapperClassName="w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      )}
                    />
                    {errors.arrivalDate && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.arrivalDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Arrival Time *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      {...register('arrivalHour', { required: 'Hour is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">Hour</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>

                    <select
                      {...register('arrivalMinute', { required: 'Minute is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">Minute</option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>

                    <select
                      {...register('arrivalPeriod', { required: 'AM/PM is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">AM/PM</option>
                      {periods.map((period) => (
                        <option key={period} value={period}>{period}</option>
                      ))}
                    </select>
                  </div>
                  {(errors.arrivalHour || errors.arrivalMinute || errors.arrivalPeriod) && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Please specify arrival hour, minute, and AM/PM.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Departure Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>2. Departure Details</span>
                <span className="text-[11px] font-normal text-slate-400">Max 3 days stay from Arrival Date</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Departure Date *</label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="departureDate"
                      rules={{
                        required: 'Departure date is required',
                        validate: (val) => {
                          const arrival = getValues('arrivalDate');
                          if (arrival && val) {
                            const arr = new Date(arrival);
                            const dep = new Date(val);
                            const diffMs = dep.getTime() - arr.getTime();
                            if (diffMs < 0) {
                              return 'Departure date cannot be before arrival date';
                            }
                            const diffDays = diffMs / (1000 * 60 * 60 * 24);
                            if (diffDays > 3) {
                              return 'Departure date cannot be more than 3 days after arrival date';
                            }
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => {
                            field.onChange(date);
                            if (getValues('arrivalDate')) {
                              trigger('arrivalDate');
                            }
                          }}
                          minDate={watch('arrivalDate') || undefined}
                          maxDate={
                            watch('arrivalDate')
                              ? new Date(new Date(watch('arrivalDate')).getTime() + 3 * 24 * 60 * 60 * 1000)
                              : undefined
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="dd/mm/yyyy"
                          className="w-full border border-[#cbd5e1] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none"
                          wrapperClassName="w-full"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      )}
                    />
                    {errors.departureDate && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.departureDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Departure Time *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      {...register('departureHour', { required: 'Hour is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">Hour</option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>

                    <select
                      {...register('departureMinute', { required: 'Minute is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">Minute</option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>

                    <select
                      {...register('departurePeriod', { required: 'AM/PM is required' })}
                      className="border border-[#cbd5e1] rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                    >
                      <option value="">AM/PM</option>
                      {periods.map((period) => (
                        <option key={period} value={period}>{period}</option>
                      ))}
                    </select>
                  </div>
                  {(errors.departureHour || errors.departureMinute || errors.departurePeriod) && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Please specify departure hour, minute, and AM/PM.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Mode Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                3. Travel Mode
              </h3>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Arrival Mode of Travel *</label>
                <select
                  {...register('travelMode', { required: 'Please select a travel mode' })}
                  className="w-full border border-[#cbd5e1] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                >
                  <option value="">Select Travel Mode</option>
                  <option value="Train">Train</option>
                  <option value="Bus">Bus</option>
                  <option value="Own Vehicle">Own Vehicle</option>
                </select>
                {errors.travelMode && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors.travelMode.message}
                  </p>
                )}
              </div>

              {/* Dynamic inputs based on travel mode */}
              <AnimatePresence mode="wait">
                {selectedTravelMode === 'Bus' && (
                  <motion.div
                    key="bus-fields"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                  >
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Bus Name *</label>
                      <input
                        type="text"
                        {...register('busName', { required: selectedTravelMode === 'Bus' ? 'Bus Name is required' : false })}
                        placeholder="e.g. Saini Travels"
                        className="w-full border border-[#cbd5e1] bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 outline-none"
                      />
                      {errors.busName && (
                        <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.busName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Bus Agency *</label>
                      <input
                        type="text"
                        {...register('busAgency', { required: selectedTravelMode === 'Bus' ? 'Bus Agency is required' : false })}
                        placeholder="e.g. MSRTC"
                        className="w-full border border-[#cbd5e1] bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 outline-none"
                      />
                      {errors.busAgency && (
                        <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.busAgency.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {selectedTravelMode === 'Train' && (
                  <motion.div
                    key="train-fields"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                  >
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Train Name / Number *</label>
                      <input
                        type="text"
                        {...register('trainNameOrNumber', { required: selectedTravelMode === 'Train' ? 'Train Name or Number is required' : false })}
                        placeholder="e.g. Gitanjali Express (12859)"
                        className="w-full border border-[#cbd5e1] bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 outline-none"
                      />
                      {errors.trainNameOrNumber && (
                        <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.trainNameOrNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Coach Number *</label>
                      <input
                        type="text"
                        {...register('coachNumber', { required: selectedTravelMode === 'Train' ? 'Coach Number is required' : false })}
                        placeholder="e.g. A1 / S4"
                        className="w-full border border-[#cbd5e1] bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 outline-none"
                      />
                      {errors.coachNumber && (
                        <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.coachNumber.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {selectedTravelMode === 'Own Vehicle' && (
                  <motion.div
                    key="vehicle-fields"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
                  >
                    <label className="text-xs font-bold text-slate-600 block mb-2">Vehicle Number *</label>
                    <input
                      type="text"
                      {...register('vehicleNumber', { required: selectedTravelMode === 'Own Vehicle' ? 'Vehicle Number is required' : false })}
                      placeholder="e.g. MH-28-AB-1234"
                      className="w-full border border-[#cbd5e1] bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 outline-none uppercase"
                    />
                    {errors.vehicleNumber && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.vehicleNumber.message}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accommodation & Guests */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                4. Accommodation & Guests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Accommodation Required? *</label>
                  <select
                    {...register('accommodationRequired')}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Number of Accompanying Family Members *</label>
                  <select
                    {...register('familyMembersCount')}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A3287]/20 focus:border-[#0A3287] outline-none bg-white"
                  >
                    <option value={0}>0 (Alone)</option>
                    <option value={1}>1 </option>
                    <option value={2}>2 </option>
                    <option value={3}>3 (Max)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Info className="w-4 h-4 shrink-0 text-slate-400" />
                <span>You can edit these details any time before September 1, 2026.</span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 md:w-auto border border-slate-250 hover:bg-slate-50 text-slate-600 font-semibold text-sm px-6 py-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 md:w-auto flex items-center justify-center gap-2 bg-[#0A3287] hover:bg-blue-900 text-white font-semibold text-sm px-8 py-3 rounded-xl transition shadow-md disabled:opacity-75"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Register Now'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
