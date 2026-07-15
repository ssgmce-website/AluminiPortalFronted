import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  TrendingUp, Send, CheckCircle2, ShieldCheck,
  Calendar, CreditCard, DollarSign, Upload, FileText,
  Loader2, AlertCircle, Info, Landmark, MailCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export const AlumniContributionForm = () => {
  const [requestStatus, setRequestStatus] = useState('idle'); // idle, loading, success
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success
  const [uploadedFileName, setUploadedFileName] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      transactionId: '',
      transactionDate: null,
      contributionType: '',
      notes: '',
    }
  });

  const handleRequestDetails = async () => {
    setRequestStatus('loading');
    try {
      await api.post('/user/contribution-details');
      setRequestStatus('success');
    } catch (err) {
      console.error('Failed to request bank details:', err);
      setRequestStatus('idle');
      alert(err?.response?.data?.message || err?.message || 'Failed to request bank details.');
    }
  };

  const onSubmitContribution = (data) => {
    setSubmitStatus('loading');
    setTimeout(() => {
      setSubmitStatus('success');
      reset();
      setUploadedFileName('');
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-800 font-sans">Contributions & Support</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Support college infrastructure, fund student scholarships, and empower the future of SSGMCE.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bank Account request and instructions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Request Bank Account Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Request Bank Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive the official SSGMCE bank details directly in your registered email inbox.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {requestStatus === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-2"
                >
                  <button
                    onClick={handleRequestDetails}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all"
                  >
                    <Send size={15} /> Request Bank Details via Email
                  </button>
                </motion.div>
              )}

              {requestStatus === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-2"
                >
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-sm text-slate-500 font-medium ml-2">Requesting details...</span>
                </motion.div>
              )}

              {requestStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5"
                >
                  <MailCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800">Email Sent!</h4>
                    <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
                      Official bank details and payment instructions have been sent successfully to your registered email address.
                    </p>
                    <button
                      onClick={() => setRequestStatus('idle')}
                      className="text-[10px] font-bold text-emerald-700 underline mt-2 block"
                    >
                      Request again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 2: Transparency & Impact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Transparency & Security
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>All contributions are directly deposited into the official college bank account.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Transactions are verified by the college finance cell, and official e-receipts are issued.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Contributions are eligible for tax benefits under active government regulations.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Submit details form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Report Contribution Details
            </h3>

            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 space-y-4"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={36} className="text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Details Submitted Successfully!</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Thank you for your generous contribution. The SSGMCE Finance Cell has received your details and will verify the transaction shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-all"
                  >
                    Report Another Contribution
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit(onSubmitContribution)}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Amount and Contribution Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Amount Contributed (INR) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                          ₹
                        </div>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                            errors.amount ? 'border-red-300 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:border-blue-500'
                          }`}
                          {...register('amount', { required: 'Please enter the amount' })}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.amount.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Contribution Purpose <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          errors.contributionType ? 'border-red-300 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:border-blue-500'
                        }`}
                        {...register('contributionType', { required: 'Please select a purpose' })}
                      >
                        <option value="">Select Option</option>
                        <option value="Infrastructure Development">Infrastructure Development</option>
                        <option value="Student Scholarships">Student Scholarships</option>
                        <option value="Department Development">Department Development</option>
                        <option value="General Development Fund">General Development Fund</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.contributionType && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.contributionType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transaction ID & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Transaction Ref / UTR Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TXN1234567890"
                        className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          errors.transactionId ? 'border-red-300 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:border-blue-500'
                        }`}
                        {...register('transactionId', { required: 'Please enter transaction reference number' })}
                      />
                      {errors.transactionId && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.transactionId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Transaction Date <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="transactionDate"
                        control={control}
                        rules={{ required: 'Please select a transaction date' }}
                        render={({ field }) => (
                          <div className="relative">
                            <DatePicker
                              selected={field.value}
                              onChange={field.onChange}
                              maxDate={new Date()}
                              placeholderText="Select Date"
                              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                                errors.transactionDate ? 'border-red-300 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:border-blue-500'
                              }`}
                            />
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                        )}
                      />
                      {errors.transactionDate && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.transactionDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Drag-and-drop Upload Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Upload Receipt / Proof (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-all relative flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload size={24} className="text-slate-400 mb-2" />
                      {uploadedFileName ? (
                        <div className="text-center">
                          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                            <FileText size={14} /> {uploadedFileName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">Click or drag to replace file</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs font-semibold text-slate-600">Drag & Drop Receipt or Browse</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message/Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Message / Special Note
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add any details, dedications, or specific instructions for your contribution..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all"
                      {...register('notes')}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all"
                    >
                      {submitStatus === 'loading' ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Submitting Contribution...
                        </>
                      ) : (
                        <>
                          Submit Contribution Details
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
