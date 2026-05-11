import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getItems, type ItemDoc } from '../services/firestoreItems';
import { getFits, type FitDoc } from '../services/firestoreFits';

interface WardrobeCtx {
  items: ItemDoc[];
  fits: FitDoc[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateItemLocal: (id: string, updates: Partial<ItemDoc>) => void;
  removeItemLocal: (id: string) => void;
  addItemLocal: (item: ItemDoc) => void;
  addFitLocal: (fit: FitDoc) => void;
  removeFitLocal: (id: string) => void;
}

const WardrobeContext = createContext<WardrobeCtx>({
  items: [], fits: [], loading: true,
  refresh: async () => {},
  updateItemLocal: () => {}, removeItemLocal: () => {}, addItemLocal: () => {},
  addFitLocal: () => {}, removeFitLocal: () => {},
});

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [fits, setFits] = useState<FitDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [itemData, fitData] = await Promise.all([getItems(user.uid), getFits(user.uid)]);
    setItems(itemData.filter(i => !i.isDeleted));
    setFits(fitData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else { setItems([]); setFits([]); setLoading(false); }
  }, [user, refresh]);

  const updateItemLocal = useCallback((id: string, updates: Partial<ItemDoc>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const removeItemLocal = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const addItemLocal = useCallback((item: ItemDoc) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const addFitLocal = useCallback((fit: FitDoc) => {
    setFits(prev => [fit, ...prev]);
  }, []);

  const removeFitLocal = useCallback((id: string) => {
    setFits(prev => prev.filter(f => f.id !== id));
  }, []);

  return (
    <WardrobeContext.Provider value={{ items, fits, loading, refresh, updateItemLocal, removeItemLocal, addItemLocal, addFitLocal, removeFitLocal }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() { return useContext(WardrobeContext); }
