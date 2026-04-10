import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getItems, type ItemDoc } from '../services/firestoreItems';

const filterTabs = ['All', 'Favorites', 'Category', 'Type'];
const mainTabs = ['Pieces', 'Fits', 'Collections'];

export default function WardrobePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Pieces');
  const [activeFilter, setActiveFilter] = useState('All');
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getItems(user.uid).then(data => {
      setItems(data.filter(i => !i.isDeleted));
      setLoading(false);
    });
  }, [user]);

  // Category breakdown for stats
  const catCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  const catColors: Record<string, string> = {
    Tops: '#f472b6', Bottoms: '#facc15', Shoes: '#93c5fd',
    Dresses: '#c084fc', Accessories: '#4ade80', Sportswear: '#fb923c',
  };

  const filteredItems = activeFilter === 'Favorites'
    ? items.filter(i => i.isFavorite)
    : items;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div style={{ width: 32 }} />
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Wardrobe</p>
        <button onClick={() => navigate('/settings')} style={{ padding: 4, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Total count */}
      <div style={{ textAlign: 'center', padding: '4px 16px 16px' }}>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0 }}>{items.length}</p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '2px 0 0' }}>pieces</p>
      </div>

      {/* Category cards */}
      {Object.keys(catCounts).length > 0 && (
        <div style={{ display: 'flex', gap: 16, padding: '0 16px 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {Object.entries(catCounts).map(([cat, count]) => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ background: catColors[cat] ?? '#d1d5db', width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{count}</span>
              </div>
              <p style={{ fontSize: 11, color: '#4b5563', margin: 0 }}>{cat}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 16px', marginBottom: 12 }}>
        {mainTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, paddingBottom: 10, fontSize: 14, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#111827' : '#9ca3af', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Pieces' && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '64px 0' }}>
          <p style={{ fontSize: 14 }}>{activeTab} coming soon</p>
        </div>
      )}

      {activeTab === 'Pieces' && (
        <>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {filterTabs.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', border: activeFilter === f ? '1px solid #111827' : '1px solid #e5e7eb', background: activeFilter === f ? '#111827' : 'white', color: activeFilter === f ? 'white' : '#374151' }}>
                {f}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading…</p>
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {/* Add piece */}
              <button onClick={() => navigate('/add')}
                style={{ aspectRatio: '1', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#9ca3af', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ fontSize: 12 }}>Add Piece</span>
              </button>

              {/* Items */}
              {filteredItems.map(item => (
                <div key={item.id} style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {/* Category badge */}
                  <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 6 }}>
                    {item.categoryId}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredItems.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: '#9ca3af' }}>
              <p style={{ fontSize: 14, margin: '0 0 8px' }}>No pieces yet</p>
              <p style={{ fontSize: 13, margin: 0 }}>Tap + to add your first item</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
