import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Persist the session in IndexedDB/localStorage so the user stays signed in
// across browser/tab close and reopen. This is Firebase's default, but we set
// it explicitly so the behaviour is intentional and obvious.
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.error('[firebase] Failed to set auth persistence:', err.message)
);

export const googleProvider = new GoogleAuthProvider();

export const storage = getStorage(app);

export default app;
