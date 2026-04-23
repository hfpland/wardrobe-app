import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface WardrobeSetup {
  customSizeTypes: string[];
  customMaterials: string[];
  customLayers: string[];
}

const DEFAULT_SETUP: WardrobeSetup = {
  customSizeTypes: [],
  customMaterials: [],
  customLayers: [],
};

function setupDoc(userId: string) {
  return doc(db, 'users', userId, 'settings', 'wardrobeSetup');
}

export async function getWardrobeSetup(userId: string): Promise<WardrobeSetup> {
  const snap = await getDoc(setupDoc(userId));
  if (!snap.exists()) return { ...DEFAULT_SETUP };
  const data = snap.data();
  return {
    customSizeTypes: data.customSizeTypes ?? [],
    customMaterials: data.customMaterials ?? [],
    customLayers: data.customLayers ?? [],
  };
}

export async function saveWardrobeSetup(userId: string, setup: WardrobeSetup): Promise<void> {
  await setDoc(setupDoc(userId), setup, { merge: true });
}
