import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Gates the alumni dashboard. Requires a signed-in user whose account has been
// approved by an admin. Pending/rejected users are sent to the approval screen.
export const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, backendError } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  // Backend unreachable — let the dashboard render its own error banner. If there's
  // no profile and no error, the user is authenticated but not registered.
  if (!userProfile) return backendError ? children : <Navigate to="/login" replace />;

  if (userProfile.role !== 'admin' && userProfile.status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  return children;
};
