import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase/firebase';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Uploads a profile photo to Firebase Storage at profile-photos/{uid} and
// returns its public download URL. The caller still needs to PUT it to the
// backend (updateProfile) to persist it on the User document.
export const uploadProfilePhoto = async (file) => {
  if (!file) throw new Error('No file selected');
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPG, PNG, or WEBP image');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be smaller than 5 MB');
  }

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You must be signed in to upload a photo');

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const photoRef = ref(storage, `profile-photos/${uid}.${ext}`);

  try {
    await uploadBytes(photoRef, file, { contentType: file.type });
    return await getDownloadURL(photoRef);
  } catch (err) {
    // Firebase Storage errors carry a `code` (e.g. storage/unauthorized) that's
    // far more useful for diagnosis than the generic message alone.
    console.error('[uploadProfilePhoto] Firebase Storage error:', err.code, err.message, err);
    if (err.code === 'storage/unauthorized') {
      throw new Error(
        'Upload blocked by Firebase Storage security rules. The rules must allow ' +
        'signed-in users to write to profile-photos/. Ask an admin to check the ' +
        'Storage rules in the Firebase console.'
      );
    }
    if (err.code === 'storage/unknown' || err.code === 'storage/retry-limit-exceeded') {
      throw new Error(
        'Could not reach Firebase Storage. This can happen if Storage hasn’t been ' +
        'enabled for this project yet, or due to a network/CORS issue.'
      );
    }
    throw err;
  }
};
