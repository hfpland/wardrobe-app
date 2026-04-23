import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface ItemDoc {
  id?: string;
  userId: string;
  name: string;
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
  updatedAt?: unknown;
}

function itemsCol(userId: string) {
  return collection(db, 'users', userId, 'items');
}

export async function createItem(userId: string, data: Omit<ItemDoc, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isFavorite' | 'usageCount' | 'isDeleted'>): Promise<string> {
  const doc: Omit<ItemDoc, 'id'> = {
    ...data,
    userId,
    isFavorite: false,
    usageCount: 0,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(itemsCol(userId), doc);
  return ref.id;
}

export async function getItems(userId: string): Promise<ItemDoc[]> {
  const q = query(itemsCol(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ItemDoc));
}

export async function getItem(userId: string, itemId: string): Promise<ItemDoc | null> {
  const snap = await getDocs(query(itemsCol(userId)));
  const found = snap.docs.find(d => d.id === itemId);
  if (!found) return null;
  return { id: found.id, ...found.data() } as ItemDoc;
}

export async function updateItem(userId: string, itemId: string, data: Partial<ItemDoc>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'items', itemId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteItems(userId: string, itemIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of itemIds) {
    batch.update(doc(db, 'users', userId, 'items', id), { isDeleted: true });
  }
  await batch.commit();
}
