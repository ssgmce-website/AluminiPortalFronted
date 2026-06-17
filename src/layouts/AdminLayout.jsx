import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const AdminLayout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck size={24} />
            Admin Portal
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100 font-medium hidden sm:block">
              {userProfile?.name || userProfile?.email}
            </span>
            <span className="text-xs bg-blue-700 px-2 py-1 rounded-md">ADMIN</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-blue-100 hover:text-white transition-colors"
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
