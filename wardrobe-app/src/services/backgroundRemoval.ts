import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';

const app = getApps()[0] ?? initializeApp();
const functions = getFunctions(app, 'us-central1');

const removeBackgroundFn = httpsCallable<{ image: string }, { image: string }>(
  functions,
  'remove_background',
  { timeout: 300000 } // 5 minutes — first call downloads the model
);

/**
 * Convert a File to a base64 string (without the data URL prefix).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:image/...;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a base64 PNG string to a File object.
 */
function base64ToFile(b64: string, filename: string): File {
  const byteString = atob(b64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], filename, { type: 'image/png' });
}

/**
 * Send an image to the Cloud Function for background removal.
 * Returns the processed File and a preview URL, or an error string if it fails.
 */
export async function removeBackground(
  file: File
): Promise<{ file: File; url: string } | { error: string }> {
  try {
    const b64 = await fileToBase64(file);
    const result = await removeBackgroundFn({ image: b64 });
    const processedFile = base64ToFile(result.data.image, 'processed.png');
    const url = URL.createObjectURL(processedFile);
    return { file: processedFile, url };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; details?: string };
    const msg = error.message || error.details || error.code || 'Unknown error';
    console.error('Background removal failed:', { code: error.code, message: error.message, details: error.details });
    return { error: msg };
  }
}
