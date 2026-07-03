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

  await uploadBytes(photoRef, file, { contentType: file.type });
  return getDownloadURL(photoRef);
};
