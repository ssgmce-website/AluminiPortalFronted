import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Guards the admin portal: requires a signed-in user with the 'admin' role.
// Non-admins are sent to their normal landing page.
export const AdminRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) return <Navigate to="/sign-in" replace />;
  // Wait for the profile to resolve before deciding.
  if (!userProfile) return null;
  if (userProfile.role !== 'admin') {
    return <Navigate to={userProfile.status === 'approved' ? '/dashboard' : '/pending'} replace />;
  }
  return children;
};
