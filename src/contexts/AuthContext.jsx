import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [backendError, setBackendError] = useState(null); // visible when backend is down
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const { data } = await api.post('/auth/sync');
          setUserProfile(data.user);
          setBackendError(null);
        } catch (err) {
          // Keep the user logged in via Firebase but flag the backend as unreachable.
          // The dashboard will show this error so the user knows something is wrong.
          const msg = err?.response?.data?.error || err?.response?.data?.message || err.message;
          console.error('[AuthContext] Backend sync failed:', msg);
          setBackendError(msg);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setBackendError(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, setUserProfile, backendError, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
