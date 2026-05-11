import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compress/resize an image file.
 * If the file is PNG (likely has transparency), keeps it as PNG.
 * Otherwise converts to JPEG for smaller size.
 */
function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<{ blob: Blob; ext: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const isPng = file.type === 'image/png';
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      if (isPng) {
        // Clear canvas to transparent for PNG
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mime = isPng ? 'image/png' : 'image/jpeg';
      const ext = isPng ? 'png' : 'jpg';

      canvas.toBlob(
        blob => blob ? resolve({ blob, ext, mime }) : reject(new Error('Compression failed')),
        mime,
        isPng ? undefined : quality
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
  const { blob, ext, mime } = await compressImage(file);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storageRef = ref(storage, `users/${userId}/items/${filename}`);
  await uploadBytes(storageRef, blob, { contentType: mime });
  return getDownloadURL(storageRef);
}
