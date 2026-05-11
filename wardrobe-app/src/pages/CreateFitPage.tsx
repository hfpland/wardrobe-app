import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWardrobe } from '../contexts/WardrobeContext';
import { type ItemDoc } from '../services/firestoreItems';
import { createFit } from '../services/firestoreFits';

type SlotKey = 'headwear' | 'outer' | 'top' | 'bottom' | 'footwear';

const SLOT_CATEGORIES: Record<SlotKey, string[]> = {
  headwear: ['Headwear'],
  outer: ['Sportswear'],
  top: ['Tops', 'Dresses'],
  bottom: ['Bottoms'],
  footwear: ['Footwear', 'Shoes'],
};

const SLOT_ORDER: SlotKey[] = ['headwear', 'outer', 'top', 'bottom', 'footwear'];

const SLOT_SIZES: Record<SlotKey, { w: number; h: number }> = {
  headwear: { w: 80, h: 80 },
  outer: { w: 160, h: 160 },
  top: { w: 150, h: 170 },
  bottom: { w: 130, h: 170 },
  footwear: { w: 110, h: 90 },
};

export default function CreateFitPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, addFitLocal } = useWardrobe();
  const [saving, setSaving] = useState(false);
  const [fitName, setFitName] = useState('');
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [accessorySheetOpen, setAccessorySheetOpen] = useState(false);

  const [selections, setSelections] = useState<Record<SlotKey, number>>({
    headwear: 0, outer: 0, top: 0, bottom: 0, footwear: 0,
  });

  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set());

  const accessoryItems = items.filter(i => i.categoryId === 'Accessories');

  function getSlotItems(slot: SlotKey): ItemDoc[] {
    return items.filter(i => SLOT_CATEGORIES[slot].includes(i.categoryId));
  }

  function getSelectedItem(slot: SlotKey): ItemDoc | null {
    const slotItems = getSlotItems(slot);
    if (slotItems.length === 0) return null;
    return slotItems[selections[slot] % slotItems.length] ?? null;
  }

  function scrollSlot(slot: SlotKey, dir: -1 | 1) {
    const slotItems = getSlotItems(slot);
    if (slotItems.length <= 1) return;
    setSelections(prev => ({
      ...prev,
      [slot]: (prev[slot] + dir + slotItems.length) % slotItems.length,
    }));
  }

  function toggleAccessory(id: string) {
    setSelectedAccessories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await createFit(user.uid, {
      name: fitName || `Fit ${new Date().toLocaleDateString()}`,
      headwear: getSelectedItem('headwear')?.id ?? null,
      top: getSelectedItem('top')?.id ?? null,
      outer: getSelectedItem('outer')?.id ?? null,
      bottom: getSelectedItem('bottom')?.id ?? null,
      shoes: getSelectedItem('footwear')?.id ?? null,
      accessories: Array.from(selectedAccessories),
    });
    navigate('/wardrobe', { replace: true });
  }

  if (loading) {
    return <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading…</p></div>;
  }

  const selectedAccItems = accessoryItems.filter(i => selectedAccessories.has(i.id!));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg-secondary)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>Cancel</button>
        <button onClick={() => setNameSheetOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', margin: 0, padding: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{fitName || 'New Fit'}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>tap to name</p>
        </button>
        <button onClick={handleSave} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>

          {/* Center column — main clothing stack */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
            {(['headwear', 'top', 'bottom', 'footwear'] as SlotKey[]).map(slot => {
              const slotItems = getSlotItems(slot);
              if (slotItems.length === 0) return null;
              const item = getSelectedItem(slot);
              const size = SLOT_SIZES[slot];
              return (
                <SwipeSlot
                  key={slot}
                  item={item}
                  width={size.w}
                  height={size.h}
                  count={slotItems.length}
                  onPrev={() => scrollSlot(slot, -1)}
                  onNext={() => scrollSlot(slot, 1)}
                />
              );
            })}
          </div>

          {/* Outer layer — left of top, slightly higher */}
          {getSlotItems('outer').length > 0 && (
            <div style={{ position: 'absolute', left: 8, top: 40, zIndex: 2 }}>
              <SwipeSlot
                item={getSelectedItem('outer')}
                width={SLOT_SIZES.outer.w}
                height={SLOT_SIZES.outer.h}
                count={getSlotItems('outer').length}
                onPrev={() => scrollSlot('outer', -1)}
                onNext={() => scrollSlot('outer', 1)}
              />
            </div>
          )}

          {/* Accessories — right side, + button lower, items grow upward */}
          {accessoryItems.length > 0 && (
            <div style={{ position: 'absolute', right: 8, bottom: 80, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 8, zIndex: 2 }}>
              <button onClick={() => setAccessorySheetOpen(true)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px dashed var(--border-strong)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {selectedAccItems.map(acc => (
                <button key={acc.id} onClick={() => toggleAccessory(acc.id!)}
                  style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--text)', background: 'var(--bg-secondary)', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                  <img src={acc.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Name sheet */}
      {nameSheetOpen && (
        <>
          <div onClick={() => setNameSheetOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text)' }}>Name this fit</p>
            <input type="text" value={fitName} onChange={e => setFitName(e.target.value)} placeholder="e.g. Casual Friday, Date Night…" autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-strong)', fontSize: 15, outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text)', boxSizing: 'border-box', marginBottom: 14, caretColor: 'var(--text)' }} />
            <button onClick={() => setNameSheetOpen(false)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          </div>
        </>
      )}

      {/* Accessories picker sheet */}
      {accessorySheetOpen && (
        <>
          <div onClick={() => setAccessorySheetOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text)' }}>Select Accessories</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {accessoryItems.map(acc => {
                const isSelected = selectedAccessories.has(acc.id!);
                return (
                  <button key={acc.id} onClick={() => toggleAccessory(acc.id!)}
                    style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: isSelected ? '3px solid var(--text)' : '3px solid transparent', background: 'var(--bg-secondary)', cursor: 'pointer', padding: 0, position: 'relative' }}>
                    <img src={acc.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth={3} style={{ width: 12, height: 12 }}><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                    {acc.name && (
                      <span style={{ position: 'absolute', bottom: 4, left: 4, right: 4, fontSize: 9, color: 'var(--text)', background: 'var(--bg)', borderRadius: 4, padding: '1px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>{acc.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setAccessorySheetOpen(false)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Done{selectedAccessories.size > 0 ? ` (${selectedAccessories.size})` : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Swipe slot ───────────────────────────────────────────────────

function SwipeSlot({ item, width, height, count, onPrev, onNext }: {
  item: ItemDoc | null;
  width: number;
  height: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchRef = useRef<{ startX: number } | null>(null);
  const mouseRef = useRef<{ startX: number; moved: boolean } | null>(null);

  function handleSwipe(dx: number) {
    if (Math.abs(dx) > 30) {
      if (dx > 0) onPrev(); else onNext();
    }
  }

  function handleClick(e: React.MouseEvent) {
    // If mouse didn't move (not a drag), use click position to determine direction
    if (mouseRef.current?.moved) return;
    if (count <= 1) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) onPrev(); else onNext();
  }

  return (
    <div
      style={{ width, height, userSelect: 'none', cursor: count > 1 ? 'pointer' : 'default' }}
      onTouchStart={e => { touchRef.current = { startX: e.touches[0].clientX }; }}
      onTouchEnd={e => { if (touchRef.current) { handleSwipe(e.changedTouches[0].clientX - touchRef.current.startX); touchRef.current = null; } }}
      onMouseDown={e => { e.preventDefault(); mouseRef.current = { startX: e.clientX, moved: false }; }}
      onMouseMove={() => { if (mouseRef.current) mouseRef.current.moved = true; }}
      onMouseUp={e => {
        if (mouseRef.current) {
          if (mouseRef.current.moved) handleSwipe(e.clientX - mouseRef.current.startX);
          mouseRef.current = null;
        }
      }}
      onClick={handleClick}
    >
      {item ? (
        <img src={item.imageUrl} alt="" draggable={false}
          style={{ width, height, objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
      ) : (
        <div style={{ width, height, background: 'var(--bg-tertiary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Empty</span>
        </div>
      )}
    </div>
  );
}
