import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  TrendingUp, Send, CheckCircle2, ShieldCheck,
  Calendar, CreditCard, Upload, FileText,
  Loader2, AlertCircle, Landmark, MailCheck, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getCountryCallingCode } from 'libphonenumber-js';
import { uploadFile } from '../services/uploadService';
import FormField from './FormField';

const DEPARTMENTS = [
  { value: 'cse', label: 'Computer Science & Engineering' },
  { value: 'it', label: 'Information Technology' },
  { value: 'entc', label: 'Electronics & Telecommunication Engineering' },
  { value: 'elpo', label: 'Electrical Engineering (Electronics & Power)' },
  { value: 'mech', label: 'Mechanical Engineering' },
  { value: 'mba', label: 'MBA' }
];

const CONTRIBUTION_TYPES = [
  'Scholarship',
  'Placement',
  'Internship',
  'Project Guidance',
  'Library books / E-books',
  'Software (Campus License) / Hardware Support',
  'Academic Interface / International University Tie-ups',
  'Technical Competition / Exhibitions / National / International Paper Contest',
  'Industrial Visit Support',
  'Entrepreneurship Support',
  'Mentoring',
  'Faculty Development',
  'R&D Support / Product / Lab Development',
  'Skill-Based / IT Certification Support',
  'Guest Lecture / Invited Talks',
  'Student Enrichment Activities'
];

const getFormattedPhone = (profile) => {
  if (!profile) return '';

  const nationalNumber =
    profile.profile?.nationalNumber || profile.nationalNumber;

  const countryCode =
    profile.profile?.countryCode || profile.countryCode;

  if (!nationalNumber) return '';

  try {
    const callingCode = getCountryCallingCode(countryCode.toUpperCase());
    return `+${callingCode} ${nationalNumber}`;
  } catch {
    return nationalNumber;
  }
};

export const AlumniContributionForm = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    alumnusName: '',
    alumniId: '',
    passoutYear: '',
    branch: '',
    email: '',
    mobile: '',
    organization: '',
    designation: '',
    target: '',
    contributionType: '',
    typeOfContribution: 'Money',
    description: '',
    amount: '',
    transactionId: '',
    paymentDate: null,
    receiptUrl: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [requestStatus, setRequestStatus] = useState('idle'); // idle, loading, success
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Pre-fill user details if logged in (identical to AlumniFeedback)
  useEffect(() => {
    if (userProfile) {
      const status = userProfile.professional?.employmentStatus || userProfile.employmentStatus;

      let org = '';
      let desig = '';

      if (status === 'Entrepreneur') {
        org = userProfile.startup?.startupName || userProfile.professional?.companyName || userProfile.startupName || userProfile.companyName || '';
        desig = userProfile.professional?.designation || 'Founder / Entrepreneur';
      } else if (status === 'Higher Studies') {
        org = userProfile.higherStudies?.universityName || userProfile.universityName || '';
        desig = userProfile.higherStudies?.higherStudiesCourse || userProfile.higherStudiesCourse || '';
      } else {
        org = userProfile.professional?.companyName || userProfile.startup?.startupName || userProfile.higherStudies?.universityName || userProfile.companyName || '';
        desig = userProfile.professional?.designation || userProfile.higherStudies?.higherStudiesCourse || userProfile.designation || '';
      }

      setFormData((prev) => ({
        ...prev,
        alumnusName: userProfile.profile?.name || userProfile.name || prev.alumnusName,
        alumniId: userProfile.alumniId || prev.alumniId,
        passoutYear: userProfile.academic?.yearOfPassout || userProfile.yearOfPassout || prev.passoutYear,
        branch: userProfile.academic?.branch || userProfile.branch || prev.branch,
        email: userProfile.email || prev.email,
        organization: org || prev.organization,
        designation: desig || prev.designation,
        mobile: getFormattedPhone(userProfile) || prev.mobile
      }));
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadingReceipt(true);
    setUploadedFileName(file.name);

    try {
      const url = await uploadFile(file, 'contributions');
      setFormData((prev) => ({ ...prev, receiptUrl: url }));
      if (fieldErrors.receiptUrl) {
        setFieldErrors((prev) => ({ ...prev, receiptUrl: '' }));
      }
    } catch (err) {
      console.error('Failed to upload receipt:', err);
      setUploadError(err.message || 'Failed to upload receipt');
      setUploadedFileName('');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const onSubmitContribution = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    // Manual client side validation
    const errors = {};
    if (!formData.alumnusName) errors.alumnusName = 'Name is required.';
    if (!formData.passoutYear) errors.passoutYear = 'Passout year is required.';
    if (!formData.branch) errors.branch = 'Branch is required.';
    if (!formData.email) errors.email = 'Email is required.';
    if (!formData.mobile) errors.mobile = 'Mobile number is required.';
    if (!formData.organization) errors.organization = 'Organization/University is required.';
    if (!formData.designation) errors.designation = 'Designation/Course is required.';
    if (!formData.target) errors.target = 'Please select the target department or college.';
    if (!formData.contributionType) errors.contributionType = 'Please select a contribution type.';

    if (formData.typeOfContribution === 'Money') {
      if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
        errors.amount = 'Please enter a valid amount.';
      }
      if (!formData.transactionId) {
        errors.transactionId = 'Transaction reference / UTR is required.';
      }
      if (!formData.paymentDate) {
        errors.paymentDate = 'Transaction date is required.';
      }
      if (!formData.receiptUrl) {
        errors.receiptUrl = 'Receipt/Proof upload is required for financial contributions.';
      }
    } else {
      if (!formData.description) {
        errors.description = 'Please enter description of the contribution.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('idle');
      return;
    }

    try {
      await api.post('/user/contributions', formData);
      setSubmitStatus('success');
    } catch (err) {
      console.error('Failed to submit contribution request:', err);
      setSubmitStatus('idle');
      alert(err?.response?.data?.message || err?.message || 'Failed to submit contribution details.');
    }
  };

  const isReadOnly = Boolean(userProfile);

  return (
    <div className="space-y-6">
      {onCancel && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            ← Back to My Contributions
          </button>
        </div>
      )}

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
          {formData.typeOfContribution === 'Money' && (
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
          )}

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                Report Contribution Details
              </h3>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel & Go Back
                </button>
              )}
            </div>

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
                      Thank you for your generous contribution. The SSGMCE Finance Cell/Admin team has received your details and will verify the transaction shortly.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSubmitStatus('idle');
                        setUploadedFileName('');
                        setFormData((prev) => ({
                          ...prev,
                          amount: '',
                          transactionId: '',
                          paymentDate: null,
                          receiptUrl: '',
                          description: '',
                          target: '',
                          contributionType: ''
                        }));
                      }}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-all"
                    >
                      Report Another Contribution
                    </button>
                    {onSuccess && (
                      <button
                        onClick={onSuccess}
                        className="inline-flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-5 rounded-lg text-sm transition-all"
                      >
                        Go to My Contributions
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={onSubmitContribution} className="space-y-5">
                  
                  {/* Section: Alumnus Details */}
                  <div className="border-b border-slate-100 pb-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
                      Alumni Details
                      {isReadOnly && (
                        <span className="text-[10px] lowercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                          <Lock size={10} /> locked (synced)
                        </span>
                      )}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Name of Alumnus"
                        name="alumnusName"
                        value={formData.alumnusName}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.alumnusName}
                        required
                      />
                      <FormField
                        label="Alumnus ID"
                        name="alumniId"
                        value={formData.alumniId}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.alumniId}
                      />
                      <FormField
                        label="Pass out Year"
                        name="passoutYear"
                        value={formData.passoutYear}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.passoutYear}
                        required
                      />
                      <FormField
                        label="Branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.branch}
                        required
                      />
                      <FormField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.email}
                        required
                        type="email"
                      />
                      <FormField
                        label="Mobile No."
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.mobile}
                        required
                        type="tel"
                      />
                      <FormField
                        label={
                          (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === 'Higher Studies'
                            ? 'University Name'
                            : (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === 'Entrepreneur'
                              ? 'Company / Startup Name'
                              : 'Name of Current Organization'
                        }
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.organization}
                        required
                      />
                      <FormField
                        label={
                          (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === 'Higher Studies'
                            ? 'Course / Specialization'
                            : 'Designation'
                        }
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        error={fieldErrors.designation}
                        required
                      />
                    </div>
                  </div>

                  {/* Section: Contribution Settings */}
                  <div className="border-b border-slate-100 pb-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-400 mb-3">
                      Contribution Area
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Contribution For (Department / College) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="target"
                          value={formData.target}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                            fieldErrors.target ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                          }`}
                        >
                          <option value="">Select Option</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                          ))}
                        </select>
                        {fieldErrors.target && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {fieldErrors.target}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Contribution Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="contributionType"
                          value={formData.contributionType}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                            fieldErrors.contributionType ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                          }`}
                        >
                          <option value="">Select Option</option>
                          {CONTRIBUTION_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {fieldErrors.contributionType && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {fieldErrors.contributionType}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Mode of Contribution <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4 mt-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="typeOfContribution"
                            value="Money"
                            checked={formData.typeOfContribution === 'Money'}
                            onChange={handleInputChange}
                            className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600"
                          />
                          Financial (Money)
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="typeOfContribution"
                            value="Other"
                            checked={formData.typeOfContribution === 'Other'}
                            onChange={handleInputChange}
                            className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600"
                          />
                          Non-Financial (Other)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section: Financial Details (if Money) */}
                  {formData.typeOfContribution === 'Money' && (
                    <div className="border-b border-slate-100 pb-4 space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                        Payment & Receipt Details
                      </h4>

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
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder="e.g. 5000"
                              className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                                fieldErrors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                              }`}
                            />
                          </div>
                          {fieldErrors.amount && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {fieldErrors.amount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Transaction Ref / UTR Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleInputChange}
                            placeholder="e.g. UTR123456789"
                            className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                              fieldErrors.transactionId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                            }`}
                          />
                          {fieldErrors.transactionId && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {fieldErrors.transactionId}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Transaction Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DatePicker
                              selected={formData.paymentDate}
                              onChange={(date) => {
                                setFormData((prev) => ({ ...prev, paymentDate: date }));
                                if (fieldErrors.paymentDate) {
                                  setFieldErrors((prev) => ({ ...prev, paymentDate: '' }));
                                }
                              }}
                              maxDate={new Date()}
                              placeholderText="Select Date"
                              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                                fieldErrors.paymentDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                              }`}
                            />
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          </div>
                          {fieldErrors.paymentDate && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {fieldErrors.paymentDate}
                            </p>
                          )}
                        </div>

                        {/* Drag-and-drop Upload Field */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Upload Receipt / Proof (Image) <span className="text-red-500">*</span>
                          </label>
                          <div className={`border-2 border-dashed ${
                            fieldErrors.receiptUrl ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-slate-50'
                          } rounded-lg p-3 hover:bg-slate-100 transition-all relative flex flex-col items-center justify-center cursor-pointer min-h-[42px]`}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={uploadingReceipt}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {uploadingReceipt ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Loader2 className="animate-spin text-blue-600" size={14} />
                                <span>Uploading...</span>
                              </div>
                            ) : uploadedFileName ? (
                              <div className="text-center">
                                <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                  <FileText size={14} /> {uploadedFileName}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Upload size={14} className="text-slate-400" />
                                <span>Choose receipt image</span>
                              </div>
                            )}
                          </div>
                          {uploadError && (
                            <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>
                          )}
                          {fieldErrors.receiptUrl && !uploadError && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {fieldErrors.receiptUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message/Notes/Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Description / Message / Notes {formData.typeOfContribution === 'Other' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={formData.typeOfContribution === 'Other' ? "Provide details of your contribution (e.g. software licenses, hardware specifications, tie-up details)..." : "Add any details, dedications, or specific instructions for your contribution..."}
                      className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                        fieldErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.description && (
                      <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> {fieldErrors.description}
                      </p>
                    )}
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
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
