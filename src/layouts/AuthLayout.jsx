import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
    <Outlet />
  </div>
);
