import { motion } from 'framer-motion';
import { Briefcase, BookOpen, Calendar, Users, UserCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Onboarding } from '../components/Onboarding';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);

const ProfileRow = ({ label, value }) => (
  <div className="flex py-3 border-b border-gray-100 last:border-0">
    <span className="w-44 text-sm text-gray-500 font-medium shrink-0">{label}</span>
    <span className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">Not set</span>}</span>
  </div>
);

export const Dashboard = () => {
  const { userProfile, backendError } = useAuth();

  // Show onboarding modal if the user hasn't completed it yet
  if (userProfile && !userProfile.isOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="space-y-8">
      {/* Backend error banner — shown when MongoDB/server is unreachable */}
      {backendError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Backend connection error</p>
            <p className="text-xs text-red-600 mt-0.5">{backendError}</p>
            <p className="text-xs text-red-500 mt-1">
              Make sure the server is running (<code>npm run dev</code> inside <code>server/</code>) and MongoDB is started.
            </p>
          </div>
        </div>
      )}
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white"
      >
        <p className="text-primary-200 text-sm font-medium mb-1">Welcome back 👋</p>
        <h1 className="text-2xl font-bold">{userProfile?.name || 'Alumni'}</h1>
        <p className="text-primary-200 text-sm mt-1">{userProfile?.email}</p>

        {userProfile?.course && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
              {userProfile.course}
            </span>
            {userProfile.branch && (
              <span className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
                {userProfile.branch}
              </span>
            )}
            {userProfile.yearOfPassout && (
              <span className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
                Batch of {userProfile.yearOfPassout}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Course" value={userProfile?.course} color="bg-primary-600" />
        <StatCard icon={Calendar} label="Admission Year" value={userProfile?.yearOfAdmission} color="bg-indigo-500" />
        <StatCard icon={CheckCircle} label="Passout Year" value={userProfile?.yearOfPassout} color="bg-emerald-500" />
        <StatCard icon={Briefcase} label="Company" value={userProfile?.companyName} color="bg-amber-500" />
      </div>

      {/* Profile details card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <UserCircle size={20} className="text-primary-600" />
            Profile Details
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            {userProfile?.authMethod?.toUpperCase()}
          </span>
        </div>

        <div className="px-6 py-2">
          <ProfileRow label="Full Name" value={userProfile?.name} />
          <ProfileRow label="Email" value={userProfile?.email} />
          <ProfileRow label="Alternate Email" value={userProfile?.alternateEmail} />
          <ProfileRow label="Contact Number" value={userProfile?.contactNumber} />
          <ProfileRow label="Date of Birth" value={userProfile?.dob ? new Date(userProfile.dob).toLocaleDateString('en-IN') : null} />
          <ProfileRow label="Branch" value={userProfile?.branch} />
          <ProfileRow label="Company" value={userProfile?.companyName} />
          <ProfileRow label="Designation" value={userProfile?.designation} />
        </div>
      </div>

      {/* Placeholder sections for future features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Network', desc: 'Connect with batchmates' },
          { icon: Briefcase, label: 'Jobs', desc: 'Alumni job postings' },
          { icon: Clock, label: 'Events', desc: 'Upcoming reunions & events' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-dashed border-gray-200 p-5 flex flex-col items-center text-center gap-2 text-gray-400">
            <Icon size={28} />
            <p className="font-semibold text-gray-600">{label}</p>
            <p className="text-xs">{desc}</p>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
};
