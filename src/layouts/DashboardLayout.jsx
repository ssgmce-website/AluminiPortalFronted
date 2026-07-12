import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

export const DashboardLayout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-85">
            <img src={logo} alt="SSGMCE Alumni Connect" className="h-9 w-9 object-contain" />
            <span className="hidden text-sm font-extrabold text-blue-800 sm:block">SSGMCE Alumni Connect</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {userProfile?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              {userProfile?.name || 'Alumni'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 transition hover:text-red-700"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};
