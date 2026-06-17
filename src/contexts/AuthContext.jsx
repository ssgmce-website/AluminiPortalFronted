import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [unregistered, setUnregistered] = useState(false); // Firebase-authed but no account
  const [backendError, setBackendError] = useState(null);  // visible when backend is down
  const [loading, setLoading]           = useState(true);

  // Apply the result of an /auth/sync call to context state.
  const applySync = (err, data) => {
    if (!err) {
      setUserProfile(data.user);
      setUnregistered(false);
      setBackendError(null);
      return data.user;
    }
    // 404 = the email isn't registered yet (not an error condition).
    if (err?.response?.status === 404) {
      setUserProfile(null);
      setUnregistered(true);
      setBackendError(null);
      return null;
    }
    const msg = err?.response?.data?.error || err?.response?.data?.message || err.message;
    console.error('[AuthContext] Backend sync failed:', msg);
    setUserProfile(null);
    setUnregistered(false);
    setBackendError(msg);
    return null;
  };

  // Re-fetch the profile from the backend (e.g. a pending user checking whether
  // an admin has approved them yet). Returns the latest profile or null.
  const refreshProfile = async () => {
    try {
      const { data } = await api.post('/auth/sync');
      return applySync(null, data);
    } catch (err) {
      return applySync(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const { data } = await api.post('/auth/sync');
          applySync(null, data);
        } catch (err) {
          applySync(err);
        }
      } else {
        setUserProfile(null);
        setUnregistered(false);
        setBackendError(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userProfile, setUserProfile, refreshProfile, unregistered, backendError, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
