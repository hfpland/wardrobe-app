import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compress an image file to max 800px wide, JPEG quality 0.8.
 * Returns a Blob.
 */
function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload an image to Firebase Storage under the user's folder.
 * Compresses first, returns the download URL.
 */
export async function uploadItemImage(userId: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, `users/${userId}/items/${filename}`);
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
