import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const currentYear = new Date().getFullYear();

const schema = z.object({
  course: z.string().min(1, 'Select a course'),
  branch: z.string().min(1, 'Select a branch'),
  yearOfAdmission: z
    .number({ invalid_type_error: 'Enter a valid year' })
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(currentYear, `Year cannot exceed ${currentYear}`),
  yearOfPassout: z
    .number({ invalid_type_error: 'Enter a valid year' })
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(currentYear + 6, 'Year seems too far in the future'),
}).refine((d) => d.yearOfPassout >= d.yearOfAdmission, {
  message: 'Passout year must be after admission year',
  path: ['yearOfPassout'],
});

const COURSES = ['B.E', 'M.E', 'MBA', 'PhD'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
];

export const Onboarding = () => {
  const { setUserProfile } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { yearOfAdmission: '', yearOfPassout: '' },
  });

  const onSubmit = async (values) => {
    const { data } = await api.post('/user/onboarding', {
      ...values,
      yearOfAdmission: Number(values.yearOfAdmission),
      yearOfPassout: Number(values.yearOfPassout),
    });
    setUserProfile(data.user);
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
            <select
              {...register('branch')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="">Select branch</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
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
