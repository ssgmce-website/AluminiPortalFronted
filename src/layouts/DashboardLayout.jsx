import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-700 font-bold text-lg">
            <GraduationCap size={24} />
            SSGMCE Alumni
          </Link>

          <div className="flex items-center gap-4">
            {userProfile?.profilePhoto ? (
              <img src={userProfile.profilePhoto} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                {userProfile?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium hidden sm:block">
              {userProfile?.name || 'Alumni'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
