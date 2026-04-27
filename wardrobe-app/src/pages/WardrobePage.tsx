import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getItems, deleteItems, updateItem, type ItemDoc } from '../services/firestoreItems';
import { DEFAULT_COLOR_PRESETS } from '../utils/colorPresets';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Dresses', 'Accessories', 'Sportswear'];
const mainTabs = ['Pieces', 'Fits', 'Collections'];
type SortKey = 'newest' | 'oldest' | 'name' | 'most-worn' | 'least-worn';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'most-worn', label: 'Most worn' },
  { key: 'least-worn', label: 'Least worn' },
];

export default function WardrobePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Pieces');
  const [activeFilter, setActiveFilter] = useState('All');
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [bulkCategorySheet, setBulkCategorySheet] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === 0) setSelectMode(false);
      return next;
    });
  }

  function handlePointerDown(id: string) {
    longPressTimer.current = setTimeout(() => {
      setSelectMode(true);
      setSelected(new Set([id]));
    }, 500);
  }

  function handlePointerUp() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function handleItemTap(id: string) {
    if (selectMode) toggleSelect(id);
    else navigate(`/wardrobe/${id}`);
  }

  async function handleDelete() {
    if (!user || selected.size === 0) return;
    setDeleting(true);
    try {
      await deleteItems(user.uid, Array.from(selected));
      setItems(prev => prev.filter(i => !selected.has(i.id!)));
      exitSelectMode();
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleting(false);
  }

  async function bulkChangeCategory(cat: string) {
    if (!user || selected.size === 0) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => updateItem(user.uid, id, { categoryId: cat })));
    setItems(prev => prev.map(i => ids.includes(i.id!) ? { ...i, categoryId: cat } : i));
    setBulkCategorySheet(false);
    exitSelectMode();
  }

  function selectAll() {
    setSelected(new Set(filteredItems.map(i => i.id!)));
  }

  useEffect(() => {
    if (!user) return;
    getItems(user.uid).then(data => {
      setItems(data.filter(i => !i.isDeleted));
      setLoading(false);
    });
  }, [user]);

  const catCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  const catColors: Record<string, string> = {
    Tops: '#f472b6', Bottoms: '#facc15', Shoes: '#93c5fd',
    Dresses: '#c084fc', Accessories: '#4ade80', Sportswear: '#fb923c',
  };

  const filteredItems = (() => {
    let result = items;
    if (activeFilter === 'Favorites') result = result.filter(i => i.isFavorite);
    if (selectedColor) result = result.filter(i => i.colors.some(c => c.toLowerCase() === selectedColor.toLowerCase()));
    if (selectedCategory) result = result.filter(i => i.categoryId === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        (i.name ?? '').toLowerCase().includes(q) ||
        (i.brand ?? '').toLowerCase().includes(q) ||
        (i.notes ?? '').toLowerCase().includes(q) ||
        (i.categoryId ?? '').toLowerCase().includes(q) ||
        (i.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'oldest': return ((a.createdAt as { seconds?: number })?.seconds ?? 0) - ((b.createdAt as { seconds?: number })?.seconds ?? 0);
        case 'name': return (a.name ?? '').localeCompare(b.name ?? '');
        case 'most-worn': return (b.usageCount ?? 0) - (a.usageCount ?? 0);
        case 'least-worn': return (a.usageCount ?? 0) - (b.usageCount ?? 0);
        default: return ((b.createdAt as { seconds?: number })?.seconds ?? 0) - ((a.createdAt as { seconds?: number })?.seconds ?? 0);
      }
    });
    return result;
  })();

  // Color data
  const colorCounts = items.reduce<Record<string, number>>((acc, item) => {
    for (const c of item.colors) { const key = c.toLowerCase(); acc[key] = (acc[key] ?? 0) + 1; }
    return acc;
  }, {});
  const availableColors = Object.entries(colorCounts).map(([hex, count]) => {
    const preset = DEFAULT_COLOR_PRESETS.find(p => p.hex.toLowerCase() === hex);
    return { hex: preset?.hex ?? hex, name: preset?.name ?? hex, count };
  }).sort((a, b) => b.count - a.count);
  const selectedColorName = selectedColor
    ? (DEFAULT_COLOR_PRESETS.find(p => p.hex.toLowerCase() === selectedColor.toLowerCase())?.name ?? selectedColor)
    : null;

  // Category data
  const availableCategories = CATEGORIES.filter(c => catCounts[c]).map(c => ({ name: c, count: catCounts[c] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 80, background: 'var(--bg)' }}>

      {/* Header */}
      {selectMode ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <button onClick={exitSelectMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>Cancel</button>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{selected.size} selected</p>
          <button onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>All</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <button onClick={() => setSearchOpen(!searchOpen)} style={{ padding: 4, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 22, height: 22 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Wardrobe</p>
          <button onClick={() => navigate('/settings')} style={{ padding: 4, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 24, height: 24 }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      )}

      {/* Search bar */}
      {searchOpen && !selectMode && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-tertiary)', transition: 'background 0.15s' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth={2} style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search name, brand, notes, tags…" autoFocus
              style={{ flex: 1, border: 'none', background: 'none', fontSize: 14, outline: 'none', color: 'var(--text)', caretColor: 'var(--text)' }} />
            {searchQuery && (
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>{filteredItems.length}</span>
            )}
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth={2} style={{ width: 16, height: 16 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Total count */}
      <div style={{ textAlign: 'center', padding: '4px 16px 16px' }}>
        <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{items.length}</p>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>pieces</p>
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
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', marginBottom: 12 }}>
        {mainTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, paddingBottom: 10, fontSize: 14, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? 'var(--text)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.15s' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Pieces' && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', padding: '64px 0' }}>
          <p style={{ fontSize: 14 }}>{activeTab} coming soon</p>
        </div>
      )}

      {activeTab === 'Pieces' && (
        <>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <FilterChip label="All" active={activeFilter === 'All' && !selectedColor && !selectedCategory} onClick={() => { setActiveFilter('All'); setSelectedColor(null); setSelectedCategory(null); }} />
            <FilterChip label="Favorites" active={activeFilter === 'Favorites'} onClick={() => { setActiveFilter(activeFilter === 'Favorites' ? 'All' : 'Favorites'); }} />
            {/* Category filter */}
            <FilterChip
              label={selectedCategory ?? 'Category'}
              active={!!selectedCategory}
              chevron
              onClick={() => setCategorySheetOpen(true)}
            />
            {/* Color filter */}
            <FilterChip
              label={selectedColorName ?? 'Color'}
              active={!!selectedColor}
              chevron
              colorDot={selectedColor ?? undefined}
              onClick={() => setColorSheetOpen(true)}
            />
            {/* Sort */}
            <FilterChip
              label={SORT_OPTIONS.find(s => s.key === sortKey)?.label ?? 'Sort'}
              active={sortKey !== 'newest'}
              chevron
              onClick={() => setSortSheetOpen(true)}
            />
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading…</p>
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <button onClick={() => navigate('/add')}
                style={{ aspectRatio: '1', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-tertiary)', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ fontSize: 12 }}>Add Piece</span>
              </button>
              {filteredItems.map(item => {
                const isSelected = selected.has(item.id!);
                return (
                  <div key={item.id}
                    onPointerDown={() => handlePointerDown(item.id!)}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onContextMenu={e => e.preventDefault()}
                    onClick={() => handleItemTap(item.id!)}
                    style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative', userSelect: 'none', WebkitUserSelect: 'none' }}>
                    <img src={item.imageUrl} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isSelected ? 0.6 : 1, transition: 'opacity 0.15s' }} />
                    {selectMode && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', border: isSelected ? 'none' : '2px solid white', background: isSelected ? '#111827' : 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                        {isSelected && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    )}
                    {!selectMode && (
                      <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 6 }}>
                        {item.categoryId}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: 14, margin: '0 0 8px' }}>No pieces yet</p>
              <p style={{ fontSize: 13, margin: 0 }}>Tap + to add your first item</p>
            </div>
          )}
        </>
      )}

      {/* Select mode action bar */}
      {selectMode && selected.size > 0 && (
        <div style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px', display: 'flex', justifyContent: 'center', gap: 10, zIndex: 50 }}>
          <button onClick={() => setBulkCategorySheet(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 999, border: 'none', background: '#111827', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Category
          </button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
            {deleting ? 'Deleting…' : `Delete${selected.size > 1 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      )}

      {/* Color filter sheet */}
      {colorSheetOpen && (
        <ExpandableSheet title="Filter by Color" onClose={() => setColorSheetOpen(false)}>
          {selectedColor && (
            <SheetRow onClick={() => { setSelectedColor(null); setColorSheetOpen(false); }}
              left={<div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>}
              label="All colors" />
          )}
          {availableColors.map(({ hex, name, count }) => {
            const isActive = selectedColor?.toLowerCase() === hex.toLowerCase();
            return (
              <SheetRow key={hex} onClick={() => { setSelectedColor(isActive ? null : hex); setColorSheetOpen(false); }}
                left={<div style={{ width: 28, height: 28, borderRadius: '50%', background: hex, border: hex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none', flexShrink: 0, boxShadow: isActive ? '0 0 0 2px white, 0 0 0 4px #111827' : 'none' }} />}
                label={name} labelBold={isActive}
                right={<span style={{ fontSize: 13, color: '#9ca3af' }}>{count} {count === 1 ? 'piece' : 'pieces'}</span>} />
            );
          })}
        </ExpandableSheet>
      )}

      {/* Category filter sheet */}
      {categorySheetOpen && (
        <ExpandableSheet title="Filter by Category" onClose={() => setCategorySheetOpen(false)}>
          {selectedCategory && (
            <SheetRow onClick={() => { setSelectedCategory(null); setCategorySheetOpen(false); }}
              left={<div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>}
              label="All categories" />
          )}
          {availableCategories.map(({ name, count }) => {
            const isActive = selectedCategory === name;
            return (
              <SheetRow key={name} onClick={() => { setSelectedCategory(isActive ? null : name); setCategorySheetOpen(false); }}
                left={<div style={{ width: 28, height: 28, borderRadius: 8, background: catColors[name] ?? '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{count}</span>
                </div>}
                label={name} labelBold={isActive}
                right={<span style={{ fontSize: 13, color: '#9ca3af' }}>{count} {count === 1 ? 'piece' : 'pieces'}</span>} />
            );
          })}
        </ExpandableSheet>
      )}
      {/* Sort sheet */}
      {sortSheetOpen && (
        <>
          <div onClick={() => setSortSheetOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text)' }}>Sort by</p>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => { setSortKey(opt.key); setSortSheetOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', fontWeight: sortKey === opt.key ? 600 : 400 }}>{opt.label}</span>
                {sortKey === opt.key && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bulk category change sheet */}
      {bulkCategorySheet && (
        <>
          <div onClick={() => setBulkCategorySheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text)' }}>Move {selected.size} item{selected.size > 1 ? 's' : ''} to…</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => bulkChangeCategory(cat)}
                  style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ── Reusable components ──────────────────────────────────────────

function FilterChip({ label, active, chevron, colorDot, onClick }: {
  label: string; active: boolean; chevron?: boolean; colorDot?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', border: active ? '1px solid var(--text)' : '1px solid var(--border-strong)', background: active ? 'var(--text)' : 'var(--bg)', color: active ? 'var(--bg)' : 'var(--text)', transition: 'all 0.15s' }}>
      {colorDot && <div style={{ width: 14, height: 14, borderRadius: '50%', background: colorDot, border: colorDot.toLowerCase() === '#ffffff' ? '1px solid var(--border-strong)' : 'none', flexShrink: 0 }} />}
      {label}
      {chevron && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );
}

function SheetRow({ onClick, left, label, labelBold, right }: {
  onClick: () => void; left: React.ReactNode; label: string; labelBold?: boolean; right?: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'opacity 0.1s' }}>
      {left}
      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: labelBold ? 600 : 500, flex: 1 }}>{label}</span>
      {right}
    </button>
  );
}

// ── Expandable bottom sheet ──────────────────────────────────────

const SHEET_MIN = 300;
const SHEET_MAX_VH = 90;
const DRAG_THRESHOLD = 8;

function ExpandableSheet({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  const maxH = typeof window !== 'undefined' ? window.innerHeight * (SHEET_MAX_VH / 100) : 700;
  const [height, setHeight] = useState(SHEET_MIN);
  const expanded = height >= maxH - 2;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [snapping, setSnapping] = useState(false);

  // Shared drag state for both touch and mouse
  const dragRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);

  function snap(h: number) {
    const mid = (SHEET_MIN + maxH) / 2;
    setSnapping(true);
    setHeight(h > mid ? maxH : SHEET_MIN);
    setTimeout(() => setSnapping(false), 300);
  }

  function handleDragMove(clientY: number) {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - clientY;
    if (!dragRef.current.moved && Math.abs(dy) < DRAG_THRESHOLD) return;
    dragRef.current.moved = true;

    const scrollEl = scrollRef.current;
    if (!expanded) {
      if (dy > 0) {
        setHeight(Math.min(maxH, dragRef.current.startH + dy));
        if (scrollEl) scrollEl.scrollTop = 0;
      }
    } else if (scrollEl && scrollEl.scrollTop <= 0 && dy < 0) {
      setHeight(Math.max(SHEET_MIN, maxH + dy));
    }
  }

  function handleDragEnd() {
    if (!dragRef.current) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current = null;
    if (wasDrag) snap(height);
  }

  // Touch events
  function onTouchStart(e: React.TouchEvent) {
    dragRef.current = { startY: e.touches[0].clientY, startH: height, moved: false };
  }
  function onTouchMove(e: React.TouchEvent) { handleDragMove(e.touches[0].clientY); }
  function onTouchEnd() { handleDragEnd(); }

  // Mouse events (only on the handle area)
  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: height, moved: false };
    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = () => { handleDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Wheel
  function onWheel(e: React.WheelEvent) {
    const scrollEl = scrollRef.current;
    if (!expanded && e.deltaY > 0) {
      e.preventDefault();
      setHeight(Math.min(maxH, height + e.deltaY * 0.8));
      return;
    }
    if (expanded && scrollEl && scrollEl.scrollTop <= 0 && e.deltaY < 0) {
      e.preventDefault();
      const next = Math.max(SHEET_MIN, height + e.deltaY * 0.8);
      setHeight(next);
      if (next < maxH - 10) { setSnapping(true); setHeight(SHEET_MIN); setTimeout(() => setSnapping(false), 300); }
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0',
          zIndex: 110, height, display: 'flex', flexDirection: 'column',
          transition: snapping ? 'height 0.3s ease' : 'none',
        }}
      >
        {/* Handle (mouse-draggable) */}
        <div onMouseDown={onHandleMouseDown} style={{ padding: '12px 16px 0', flexShrink: 0, cursor: 'grab' }}>
          <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 14px' }} />
        </div>

        {/* Sticky title */}
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text)' }}>{title}</p>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{ overflowY: expanded ? 'auto' : 'hidden', padding: '0 16px 36px', flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </>
  );
}
