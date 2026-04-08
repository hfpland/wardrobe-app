import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categoryColors: Record<string, string> = {
  Pants: '#f472b6',
  Shoes: '#facc15',
  Tops: '#93c5fd',
  Accessories: '#4ade80',
};

const mockCategories = [
  { name: 'Pants', count: 2, value: 'Rp 546' },
  { name: 'Shoes', count: 4, value: 'Rp 495' },
  { name: 'Tops', count: 8, value: 'Rp 299' },
  { name: 'Accessories', count: 4, value: 'Rp 120' },
];

const filterTabs = ['All', 'Favorites', 'Category', 'Type'];
const mainTabs = ['Pieces', 'Fits', 'Collections'];

export default function WardrobePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Pieces');
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div style={{ width: 32 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 999, padding: '4px 12px', fontSize: 14, fontWeight: 500, color: '#374151', background: 'white', cursor: 'pointer' }}>
          Neckworth
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button onClick={() => navigate('/settings')} style={{ padding: 4, color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Total value */}
      <div style={{ textAlign: 'center', padding: '8px 16px 16px' }}>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0 }}>Rp 1.460</p>
      </div>

      {/* Category cards */}
      <div style={{ display: 'flex', gap: 16, padding: '0 16px 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {mockCategories.map((cat) => (
          <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{cat.value}</p>
            <div style={{ background: categoryColors[cat.name], width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>{cat.count}</span>
            </div>
            <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Tabs: Pieces / Fits / Collections */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 16px', marginBottom: 12 }}>
        {mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingBottom: 10,
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#111827' : '#9ca3af',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Non-Pieces placeholder */}
      {activeTab !== 'Pieces' && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '64px 0' }}>
          <p style={{ fontSize: 14 }}>{activeTab} coming soon</p>
        </div>
      )}

      {/* Pieces content */}
      {activeTab === 'Pieces' && (
        <>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {filterTabs.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: activeFilter === f ? '1px solid #111827' : '1px solid #e5e7eb',
                  background: activeFilter === f ? '#111827' : 'white',
                  color: activeFilter === f ? 'white' : '#374151',
                }}
              >
                {f}
                {(f === 'Category' || f === 'Type') && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <button
              onClick={() => navigate('/add')}
              style={{ aspectRatio: '1', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#9ca3af', border: 'none', cursor: 'pointer' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span style={{ fontSize: 12 }}>Add Piece</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
