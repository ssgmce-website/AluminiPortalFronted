import api from './api';
import imageCompression from 'browser-image-compression';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

/**
 * Generic file upload method to send images to dynamic subfolders.
 *
 * @param {File} file          The file to upload
 * @param {string} folderType  Target subfolder on the server ('profiles', 'gallery', etc.)
 * @returns {Promise<string>}  The public URL of the uploaded image
 */
export const uploadFile = async (file, folderType = 'others') => {
  if (!file) throw new Error('No file selected');
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPG, PNG, or JPEG image');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be smaller than 5 MB');
  }

  // Compress image before uploading
  let compressedFile = file;
  try {
    const options = {
      maxSizeMB: 1, // Target max 1MB
      maxWidthOrHeight: 1200, // Max dimension
      useWebWorker: true,
      initialQuality: 0.95, // High visual quality (almost lossless)
    };
    compressedFile = await imageCompression(file, options);
  } catch (compressErr) {
    console.warn('[uploadFile] Image compression failed, uploading original:', compressErr);
  }

  const formData = new FormData();
  formData.append('image-file', compressedFile);

  try {
    const { data } = await api.post(`/upload/image-file/${folderType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (data?.success && data?.data?.url) {
      return data.data.url;
    }
    throw new Error('Upload failed: Server did not return a valid URL.');
  } catch (err) {
    console.error('[uploadFile] upload error:', err);
    const errMsg = err?.response?.data?.message || err?.message || 'File upload failed';
    throw new Error(errMsg);
  }
};

/**
 * Uploads a profile photo to the backend 'profiles' storage and returns its URL.
 *
 * @param {File} file  The file object from input type="file"
 * @returns {Promise<string>} The public web URL of the uploaded image
 */
export const uploadProfilePhoto = async (file) => {
  return uploadFile(file, 'profile-photos');
};
