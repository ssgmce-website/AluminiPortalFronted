import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, RefreshCw, LogOut, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import { routeForProfile } from '../utils/authRoutes';
import api from '../services/api';

export const PendingApproval = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [justChecked, setJustChecked] = useState(false);

  const status = userProfile?.status;

  // Once the admin approves (or this is actually an admin), bounce to the right page.
  useEffect(() => {
    if (userProfile && (userProfile.role === 'admin' || userProfile.status === 'approved')) {
      navigate(routeForProfile(userProfile), { replace: true });
    }
  }, [userProfile, navigate]);

  if (!currentUser) return <Navigate to="/login" replace />;

  const handleCheck = async () => {
    setChecking(true);
    setJustChecked(false);
    try {
      // Call the check-email API to see if approval status has changed
      const { data } = await api.post('/auth/check-email', { email: currentUser.email });
      const status = data?.data?.status;
      
      const profile = await refreshProfile();
      if (profile && (profile.role === 'admin' || profile.status === 'approved')) {
        navigate(routeForProfile(profile), { replace: true });
      }
    } catch (err) {
      console.error('Failed to check email status:', err);
      await refreshProfile();
    } finally {
      setChecking(false);
      setJustChecked(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const rejected = status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
      >
        <div
          className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${rejected ? 'bg-red-100' : 'bg-amber-100'
            }`}
        >
          {rejected ? (
            <XCircle size={32} className="text-red-600" />
          ) : (
            <Clock size={32} className="text-amber-600" />
          )}
        </div>

        {rejected ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Request not approved</h1>
            <p className="text-gray-500 text-sm mt-2">
              Unfortunately, your account request was not approved by the administrator.
            </p>
            {userProfile?.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 text-left">
                <span className="font-semibold">Reason:</span> {userProfile.rejectionReason}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">
              If you believe this is a mistake, please contact the alumni cell.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Account awaiting verification</h1>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              Thanks for signing up{userProfile?.name ? `, ${userProfile.name}` : ''}! Your account
              request has been sent to the administrator for verification.
            </p>

            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 text-left space-y-2">
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <span>
                  Once an admin <strong>approves your request</strong>, you’ll be notified by email at{' '}
                  <strong>{currentUser.email}</strong> and can sign in.
                </span>
              </div>
            </div>

            {justChecked && !checking && (
              <p className="text-xs text-gray-500 mt-3">
                Still pending — we’ll email you the moment you’re approved.
              </p>
            )}
          </>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {!rejected && (
            <button
              onClick={handleCheck}
              disabled={checking}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {checking ? 'Checking…' : 'Check approval status'}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
};
