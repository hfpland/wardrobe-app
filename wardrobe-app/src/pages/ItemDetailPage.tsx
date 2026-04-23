import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getItem, updateItem, deleteItems, type ItemDoc } from '../services/firestoreItems';
import { DEFAULT_COLOR_PRESETS } from '../utils/colorPresets';
import { getWardrobeSetup } from '../services/wardrobeSetup';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Dresses', 'Accessories', 'Sportswear'];
const BASE_MATERIALS = ['Cotton', 'Denim', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Leather', 'Chambray', 'Fleece', 'Knit'];
const BASE_LAYERS = ['Inner', 'Outer', 'Both'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Worn'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All season'];

const MEASUREMENT_FIELDS: Record<string, string[]> = {
  Tops: ['Body width', 'Body length', 'Sleeve length', 'Shoulder width'],
  Bottoms: ['Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh'],
  Dresses: ['Bust', 'Waist', 'Hip', 'Length', 'Sleeve length'],
  Shoes: ['Insole length', 'Foot width'],
  Accessories: ['Diameter', 'Length', 'Width'],
  Sportswear: ['Body width', 'Body length', 'Sleeve length', 'Inseam'],
  _default: ['Length', 'Width', 'Height'],
};

type ActiveSheet = 'name' | 'category' | 'brand' | 'size' | 'material' | 'layer' | 'condition' | 'season' | 'notes' | 'measurements' | 'colors' | null;

const penIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

function formatDate(ts: unknown): string | null {
  if (!ts || typeof ts !== 'object') return null;
  const d = (ts as { toDate?: () => Date }).toDate?.();
  if (!d) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState<string[]>([]);
  const [layer, setLayer] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [season, setSeason] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<string[]>([]);
  const [allMaterials, setAllMaterials] = useState<string[]>(BASE_MATERIALS);
  const [allLayers, setAllLayers] = useState<string[]>(BASE_LAYERS);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([getItem(user.uid, id), getWardrobeSetup(user.uid)]).then(([data, setup]) => {
      if (data) {
        setItem(data);
        setName(data.name ?? '');
        setCategory(data.categoryId);
        setBrand(data.brand ?? '');
        setSize(data.sizeLabel ?? '');
        setMaterial(data.material ?? []);
        setLayer(data.layer);
        setCondition(data.condition);
        setSeason(data.season ?? []);
        setNotes(data.notes ?? '');
        setMeasurements(data.measurements ?? {});
        setColors(data.colors ?? []);
      }
      setAllMaterials([...BASE_MATERIALS, ...setup.customMaterials]);
      setAllLayers([...BASE_LAYERS, ...setup.customLayers]);
      setLoading(false);
    });
  }, [user, id]);

  function markDirty() { if (!dirty) setDirty(true); }
  const snapshot = useRef<Record<string, unknown>>({});

  function openSheet(field: ActiveSheet) {
    switch (field) {
      case 'name': snapshot.current = { val: name }; break;
      case 'category': snapshot.current = { val: category }; break;
      case 'brand': snapshot.current = { val: brand }; break;
      case 'size': snapshot.current = { val: size }; break;
      case 'material': snapshot.current = { val: [...material] }; break;
      case 'layer': snapshot.current = { val: layer }; break;
      case 'condition': snapshot.current = { val: condition }; break;
      case 'season': snapshot.current = { val: [...season] }; break;
      case 'notes': snapshot.current = { val: notes }; break;
      case 'measurements': snapshot.current = { val: { ...measurements } }; break;
      case 'colors': snapshot.current = { val: [...colors] }; break;
    }
    setActiveSheet(field);
  }

  function cancelSheet() {
    switch (activeSheet) {
      case 'name': setName(snapshot.current.val as string); break;
      case 'category': setCategory(snapshot.current.val as string); break;
      case 'brand': setBrand(snapshot.current.val as string); break;
      case 'size': setSize(snapshot.current.val as string); break;
      case 'material': setMaterial(snapshot.current.val as string[]); break;
      case 'layer': setLayer(snapshot.current.val as string | null); break;
      case 'condition': setCondition(snapshot.current.val as string | null); break;
      case 'season': setSeason(snapshot.current.val as string[]); break;
      case 'notes': setNotes(snapshot.current.val as string); break;
      case 'measurements': setMeasurements(snapshot.current.val as Record<string, string>); break;
      case 'colors': setColors(snapshot.current.val as string[]); break;
    }
    setActiveSheet(null);
  }

  function confirmSheet() { markDirty(); setActiveSheet(null); }

  async function handleSave() {
    if (!user || !item?.id) return;
    setSaving(true);
    const updates: Partial<ItemDoc> = { name, categoryId: category, brand, sizeLabel: size, material, layer, condition, season, notes, measurements, colors };
    await updateItem(user.uid, item.id, updates);
    setItem(prev => prev ? { ...prev, ...updates } : prev);
    setDirty(false);
    setSaving(false);
  }

  async function toggleFavorite() {
    if (!user || !item?.id) return;
    const next = !item.isFavorite;
    setItem(prev => prev ? { ...prev, isFavorite: next } : prev);
    await updateItem(user.uid, item.id, { isFavorite: next });
  }

  async function confirmDelete() {
    if (!user || !item?.id) return;
    setDeleting(true);
    await deleteItems(user.uid, [item.id]);
    navigate('/wardrobe', { replace: true });
  }

  if (loading) return <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p></div>;
  if (!item) return <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}><p style={{ color: '#9ca3af', fontSize: 14 }}>Item not found</p><button onClick={() => navigate('/wardrobe')} style={{ fontSize: 14, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Back to wardrobe</button></div>;

  const editRow = (label: string, value: string | null | undefined, field: ActiveSheet) => (
    <button onClick={() => openSheet(field)}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', margin: 0, background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', gap: 12, font: 'inherit', lineHeight: 'inherit', boxSizing: 'border-box' }}>
      <span style={{ fontSize: 14, color: '#6b7280', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
      {penIcon}
    </button>
  );

  const infoRow = (label: string, value: string | null | undefined) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', gap: 12 }}>
      <span style={{ fontSize: 14, color: '#6b7280', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
    </div>
  );

  const measurementStr = (() => {
    const fields = MEASUREMENT_FIELDS[category] ?? MEASUREMENT_FIELDS._default;
    const filled = fields.filter(f => measurements[f]).map(f => `${f} ${measurements[f]}`);
    return filled.length ? filled.join(' · ') : null;
  })();

  const sheetBackdrop = <div onClick={cancelSheet} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />;
  const sheetContainer = (children: React.ReactNode) => (<>{sheetBackdrop}<div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '70vh', overflowY: 'auto' }}><div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />{children}</div></>);

  const chipSheet = (title: string, options: string[], selected: string | null, onSelect: (v: string | null) => void) =>
    sheetContainer(<><p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{options.map(opt => (<button key={opt} onClick={() => { onSelect(opt === selected ? null : opt); confirmSheet(); }} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: selected === opt ? '1px solid #111827' : '1px solid #e5e7eb', background: selected === opt ? '#111827' : 'white', color: selected === opt ? 'white' : '#374151' }}>{opt}</button>))}</div></>);

  const multiChipSheet = (title: string, options: string[], selected: string[], onToggle: (v: string[]) => void) =>
    sheetContainer(<><p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>{options.map(opt => { const active = selected.includes(opt); return (<button key={opt} onClick={() => onToggle(active ? selected.filter(s => s !== opt) : [...selected, opt])} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #111827' : '1px solid #e5e7eb', background: active ? '#111827' : 'white', color: active ? 'white' : '#374151' }}>{opt}</button>); })}</div><button onClick={confirmSheet} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button></>);

  const textSheet = (title: string, value: string, onChange: (v: string) => void, placeholder: string) =>
    sheetContainer(<><p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p><input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 14, caretColor: '#111827' }} /><button onClick={confirmSheet} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button></>);

  const notesSheet = () =>
    sheetContainer(<><p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Notes</p><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything worth remembering…" rows={4} autoFocus style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14, caretColor: '#111827' }} /><button onClick={confirmSheet} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button></>);

  const measurementsSheet = () => { const fields = MEASUREMENT_FIELDS[category] ?? MEASUREMENT_FIELDS._default; return sheetContainer(<><p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Measurements</p><div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>{fields.map(label => (<div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 14, color: '#6b7280', width: 120, flexShrink: 0 }}>{label}</span><input type="number" value={measurements[label] ?? ''} onChange={e => setMeasurements(prev => ({ ...prev, [label]: e.target.value }))} placeholder="—" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} /><span style={{ fontSize: 12, color: '#9ca3af', width: 30 }}>cm</span></div>))}</div><button onClick={confirmSheet} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button></>); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', overflowY: 'auto', paddingBottom: 100 }}>
      {/* Top bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 16px 8px', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        <div style={{ justifySelf: 'start' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Back</button>
        </div>
        <div />
        <div style={{ justifySelf: 'end', display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting} aria-label="Delete item" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: deleting ? 0.5 : 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image + Favorite */}
      <div style={{ position: 'relative', padding: '0 0 16px' }}>
        <img src={item.imageUrl} alt="clothing item" style={{ width: '100%', objectFit: 'contain', display: 'block', maxHeight: '50vh', background: '#f9fafb' }} />
        <button onClick={toggleFavorite} aria-label={item.isFavorite ? 'Unfavorite' : 'Favorite'}
          style={{ position: 'absolute', bottom: 24, right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
          <svg viewBox="0 0 24 24" fill={item.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)'} stroke={item.isFavorite ? '#ef4444' : 'white'} strokeWidth={2} style={{ width: 24, height: 24 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Name row — prominent, like product title */}
      <button onClick={() => openSheet('name')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit', boxSizing: 'border-box', margin: 0 }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: name ? '#111827' : '#d1d5db' }}>{name || 'Untitled piece'}</span>
          </div>
        </div>
        {penIcon}
      </button>

      {/* Colors */}
      <button onClick={() => openSheet('colors')}
        style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12, background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit', lineHeight: 'inherit', boxSizing: 'border-box', margin: 0 }}>
        <span style={{ fontSize: 14, color: '#6b7280', width: 110, flexShrink: 0 }}>Colors</span>
        {colors.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
            {colors.map(hex => {
              const preset = DEFAULT_COLOR_PRESETS.find(p => p.hex.toLowerCase() === hex.toLowerCase());
              return (<div key={hex} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 18, height: 18, borderRadius: '50%', background: hex, border: hex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none', flexShrink: 0 }} /><span style={{ fontSize: 13, color: '#374151' }}>{preset?.name ?? hex}</span></div>);
            })}
          </div>
        ) : (<span style={{ fontSize: 14, color: '#d1d5db', flex: 1 }}>—</span>)}
        {penIcon}
      </button>

      {/* Editable rows */}
      <div>
        {editRow('Category', category || null, 'category')}
        {editRow('Brand', brand || null, 'brand')}
        {editRow('Size', size || null, 'size')}
        {editRow('Material', material.length ? material.join(', ') : null, 'material')}
        {editRow('Layer', layer, 'layer')}
        {editRow('Condition', condition, 'condition')}
        {editRow('Season', season.length ? season.join(', ') : null, 'season')}
        {editRow('Measurements', measurementStr, 'measurements')}
        {editRow('Notes', notes ? (notes.length > 30 ? notes.slice(0, 30) + '…' : notes) : null, 'notes')}
      </div>

      {/* Read-only info */}
      <div style={{ marginTop: 8 }}>
        {infoRow('Worn', `${item.usageCount} time${item.usageCount !== 1 ? 's' : ''}`)}
        {infoRow('Added', formatDate(item.createdAt) ?? '—')}
        {infoRow('Edited', formatDate(item.updatedAt) ?? '—')}
      </div>

      {/* Save button */}
      {dirty && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px 0' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: saving ? 0.6 : 1 }}>
            {saving ? (
              <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="50 20" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><polyline points="20 6 9 17 4 12" /></svg>
            )}
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100% - 48px)', maxWidth: 340, background: 'white', borderRadius: 20, zIndex: 210, padding: '28px 24px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Delete item?</p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
              Are you sure you want to delete{name ? ` "${name}"` : ' this item'}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom sheets */}
      {activeSheet === 'name' && textSheet('Name', name, setName, 'e.g. AIRism Cotton Crew Neck T-Shirt')}
      {activeSheet === 'category' && chipSheet('Category', CATEGORIES, category, v => setCategory(v ?? ''))}
      {activeSheet === 'material' && multiChipSheet('Material', allMaterials, material, setMaterial)}
      {activeSheet === 'layer' && chipSheet('Layer', allLayers, layer, setLayer)}
      {activeSheet === 'condition' && chipSheet('Condition', CONDITIONS, condition, setCondition)}
      {activeSheet === 'season' && multiChipSheet('Season', SEASONS, season, setSeason)}
      {activeSheet === 'brand' && textSheet('Brand', brand, setBrand, 'e.g. Nike, Zara, Uniqlo…')}
      {activeSheet === 'size' && textSheet('Size', size, setSize, 'e.g. M, 32, US 10…')}
      {activeSheet === 'notes' && notesSheet()}
      {activeSheet === 'measurements' && measurementsSheet()}
      {activeSheet === 'colors' && (() => {
        const presetHexes = new Set(DEFAULT_COLOR_PRESETS.map(p => p.hex.toLowerCase()));
        const customColors = colors.filter(c => !presetHexes.has(c.toLowerCase()));
        return sheetContainer(
          <>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Colors</p>
            {customColors.length > 0 && (<><p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>{customColors.map(hex => { const sel = colors.includes(hex); return (<button key={hex} onClick={() => setColors(prev => sel ? prev.filter(c => c !== hex) : [...prev, hex])} title={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: hex, boxShadow: sel ? '0 0 0 3px white, 0 0 0 5px #111827' : '0 1px 3px rgba(0,0,0,0.15)' }} /><span style={{ fontSize: 9, color: '#6b7280', maxWidth: 44, textAlign: 'center', lineHeight: 1.2 }}>{hex}</span></button>); })}</div></>)}
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {DEFAULT_COLOR_PRESETS.map(preset => { const sel = colors.some(c => c.toLowerCase() === preset.hex.toLowerCase()); return (<button key={preset.hex} onClick={() => setColors(prev => sel ? prev.filter(c => c.toLowerCase() !== preset.hex.toLowerCase()) : [...prev, preset.hex])} title={preset.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: preset.hex, boxShadow: sel ? '0 0 0 3px white, 0 0 0 5px #111827' : '0 1px 3px rgba(0,0,0,0.15)', border: preset.hex === '#ffffff' ? '1px solid #e5e7eb' : 'none' }} /><span style={{ fontSize: 9, color: '#6b7280', maxWidth: 44, textAlign: 'center', lineHeight: 1.2 }}>{preset.name}</span></button>); })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)' }} />
                Custom color
                <input type="color" style={{ display: 'none' }} onChange={e => { const hex = e.target.value; if (!colors.some(c => c.toLowerCase() === hex.toLowerCase())) setColors(prev => [...prev, hex]); }} />
              </label>
            </div>
            <button onClick={confirmSheet} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          </>
        );
      })()}
    </div>
  );
}
