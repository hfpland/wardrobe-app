import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface OutfitSet {
  fitId?: string | null;       // reference to a saved fit, or null if custom
  itemIds: string[];           // individual item ids (if custom)
}

export interface CalendarEntry {
  id?: string;                 // doc id = "YYYY-MM-DD"
  userId: string;
  date: string;                // "YYYY-MM-DD"
  outfits: OutfitSet[];        // 1-3 outfit sets for the day
}

function calCol(userId: string) {
  return collection(db, 'users', userId, 'calendar');
}

export async function getCalendarMonth(userId: string, year: number, month: number): Promise<CalendarEntry[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  const q = query(calCol(userId), where('date', '>=', startDate), where('date', '<=', endDate));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEntry));
}

export async function setCalendarEntry(userId: string, entry: Omit<CalendarEntry, 'id' | 'userId'>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'calendar', entry.date);
  await setDoc(docRef, { ...entry, userId }, { merge: true });
}

export async function deleteCalendarEntry(userId: string, date: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'calendar', date));
}
