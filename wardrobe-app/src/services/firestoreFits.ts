import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface FitDoc {
  id?: string;
  userId: string;
  name: string;
  headwear: string | null;
  top: string | null;
  outer: string | null;
  bottom: string | null;
  shoes: string | null;
  accessories: string[];    // multiple accessory item ids
  createdAt?: unknown;
}

function fitsCol(userId: string) {
  return collection(db, 'users', userId, 'fits');
}

export async function createFit(userId: string, data: Omit<FitDoc, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(fitsCol(userId), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getFits(userId: string): Promise<FitDoc[]> {
  const q = query(fitsCol(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FitDoc));
}

export async function deleteFit(userId: string, fitId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'fits', fitId));
}
