import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2, MicVocalIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const currentYear = new Date().getFullYear();

const schema = z.object({
  course: z.string().min(1, 'Select a course'),
  branch: z.string().min(1, 'Select a branch'),
  yearOfAdmission: z
    .number({ invalid_type_error: 'Enter a valid year' })
    .int()
    .min(1983, 'Year must be 1983 or later')
    .max(currentYear, 'Year of admission cannot be in the future'),
  yearOfPassout: z
    .number({ invalid_type_error: 'Enter a valid year' })
    .int()
    .min(1985, 'Year must be 1985 or later')
    .max(currentYear + 6, 'Year of passout is too far in the future'),
}).refine((d) => d.yearOfPassout >= d.yearOfAdmission, {
  message: 'Year of passout cannot be before the year of admission',
  path: ['yearOfPassout'],
}).refine((d) => d.yearOfPassout - d.yearOfAdmission >= 2, {
  message: 'Gap between year of admission and year of passout must be at least 2 years',
  path: ['yearOfPassout'],
});

const COURSES = ['B.E/B.Tech', 'M.E/M.Tech', 'MBA', 'MCA', 'PhD'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'MCA',
  'MBA'
];

export const Onboarding = () => {
  const { setUserProfile } = useAuth();

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { course: '', branch: '', yearOfAdmission: '', yearOfPassout: '' },
  });

  const selectedCourse = watch('course');

  useEffect(() => {
    if (selectedCourse === 'MCA') {
      setValue('branch', 'MCA');
    } else if (selectedCourse === 'MBA') {
      setValue('branch', 'MBA');
    } else {
      const currentBranch = getValues('branch');
      if (currentBranch === 'MCA' || currentBranch === 'MBA') {
        setValue('branch', '');
      }
    }
  }, [selectedCourse, setValue, getValues]);

  const onSubmit = async (values) => {
    const { data } = await api.post('/user/onboarding', {
      ...values,
      yearOfAdmission: Number(values.yearOfAdmission),
      yearOfPassout: Number(values.yearOfPassout),
    });
    setUserProfile(data.data.user);
  };

  return (
    // Full-screen backdrop
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-primary-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tell us about your academic background
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              {...register('course')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">Select course</option>
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Department</label>
            {selectedCourse && (selectedCourse === 'MCA' || selectedCourse === 'MBA') ? (
              <div>
                <input
                  type="text"
                  value={selectedCourse}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-semibold"
                />
                <input type="hidden" {...register('branch')} />
              </div>
            ) : (
              <select
                {...register('branch')}
                disabled={!selectedCourse}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{selectedCourse ? 'Select branch' : 'Select course first'}</option>
                {BRANCHES.filter(b => b !== 'MCA' && b !== 'MBA').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
            {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
          </div>

          {/* Year of Admission / Passout — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
              <input
                {...register('yearOfAdmission', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 2019"
                min="1990"
                max={currentYear}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              {errors.yearOfAdmission && (
                <p className="text-red-500 text-xs mt-1">{errors.yearOfAdmission.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year</label>
              <input
                {...register('yearOfPassout', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 2023"
                min="1990"
                max={currentYear + 6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              {errors.yearOfPassout && (
                <p className="text-red-500 text-xs mt-1">{errors.yearOfPassout.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
