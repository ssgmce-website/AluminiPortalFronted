import { Navigate } from 'react-router-dom';
import { isAdminAuthed } from '../services/adminAuth';

// Guards the admin portal. Admin auth is standalone (email + password → signed
// token in localStorage), completely separate from the alumni Firebase session.
// No valid admin token → send to the admin login page.
export const AdminRoute = ({ children }) => {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return children;
};
