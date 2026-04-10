import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface ItemDoc {
  id?: string;
  userId: string;
  categoryId: string;
  imageUrl: string;
  colors: string[];
  brand: string;
  season: string[];
  notes: string;
  material: string[];
  sizeLabel: string;
  layer: string | null;
  condition: string | null;
  measurements: Record<string, string>;
  isFavorite: boolean;
  usageCount: number;
  isDeleted: boolean;
  createdAt?: unknown;
}

function itemsCol(userId: string) {
  return collection(db, 'users', userId, 'items');
}

export async function createItem(userId: string, data: Omit<ItemDoc, 'id' | 'userId' | 'createdAt' | 'isFavorite' | 'usageCount' | 'isDeleted'>): Promise<string> {
  const doc: Omit<ItemDoc, 'id'> = {
    ...data,
    userId,
    isFavorite: false,
    usageCount: 0,
    isDeleted: false,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(itemsCol(userId), doc);
  return ref.id;
}

export async function getItems(userId: string): Promise<ItemDoc[]> {
  const q = query(itemsCol(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ItemDoc));
}
