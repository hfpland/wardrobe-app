import { useState } from 'react';

const MATERIALS = ['Cotton', 'Denim', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Leather', 'Chambray', 'Fleece', 'Knit'];
const LAYERS = ['Inner', 'Outer', 'Both'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Worn'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All season'];

type SizeType = 'standard' | 'collar' | 'shoes' | 'waist' | 'ring_watch' | 'one_size';
const SIZE_TYPES: { key: SizeType; label: string }[] = [
  { key: 'standard', label: 'Standard' },
  { key: 'collar', label: 'Collar' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'waist', label: 'Waist' },
  { key: 'ring_watch', label: 'Ring / Watch' },
  { key: 'one_size', label: 'One Size' },
];
type ShoeFormat = 'US' | 'UK' | 'EU';
const STANDARD_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLLAR_SIZES = ['14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5', '18'];
const WAIST_SIZES = ['26', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40'];
const SHOE_SIZES: Record<ShoeFormat, string[]> = {
  US: ['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13','14','15'],
  UK: ['3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','12','13','14'],
  EU: ['35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50'],
};
const WATCH_SIZES = ['36', '38', '40', '42', '44', '46'];

const MEASUREMENT_FIELDS: Record<string, string[]> = {
  Tops: ['Body width', 'Body length', 'Sleeve length', 'Shoulder width'],
  Bottoms: ['Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh'],
  Dresses: ['Bust', 'Waist', 'Hip', 'Length', 'Sleeve length'],
  Shoes: ['Insole length', 'Foot width'],
  Accessories: ['Diameter', 'Length', 'Width'],
  Sportswear: ['Body width', 'Body length', 'Sleeve length', 'Inseam'],
  _default: ['Length', 'Width', 'Height'],
};

function defaultSizeType(category: string | null): SizeType {
  switch (category) {
    case 'Tops': return 'standard';
    case 'Bottoms': return 'waist';
    case 'Shoes': return 'shoes';
    case 'Accessories': return 'ring_watch';
    default: return 'standard';
  }
}

export interface DetailsData {
  brand: string;
  season: string[];
  notes: string;
  material: string[];
  sizeLabel: string;
  layer: string | null;
  condition: string | null;
  measurements: Record<string, string>;
}

interface Props {
  photoUrl: string | null;
  selectedCategory: string | null;
  data: DetailsData;
  onChange: (d: DetailsData) => void;
  onBack: () => void;
  onSave: () => void;
}

type EditField = 'material' | 'size' | 'measurements' | 'layer' | 'condition' | 'brand' | 'season' | 'notes' | null;

const penIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export default function DetailsStep({ photoUrl, selectedCategory, data: d, onChange, onBack, onSave }: Props) {
  const [editing, setEditing] = useState<EditField>(null);
  const set = <K extends keyof DetailsData>(key: K, val: DetailsData[K]) => onChange({ ...d, [key]: val });

  const row = (label: string, value: string | null | undefined, field: EditField) => (
    <button onClick={() => setEditing(field)}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
      <span style={{ fontSize: 14, color: '#6b7280', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
      {penIcon}
    </button>
  );

  const chipSheet = (title: string, options: string[], selected: string | null, onSelect: (v: string | null) => void) => (
    <>
      <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onSelect(opt === selected ? null : opt); setEditing(null); }}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: selected === opt ? '1px solid #111827' : '1px solid #e5e7eb', background: selected === opt ? '#111827' : 'white', color: selected === opt ? 'white' : '#374151' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const multiChipSheet = (title: string, options: string[], selected: string[], onToggle: (v: string[]) => void) => (
    <>
      <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <button key={opt} onClick={() => onToggle(active ? selected.filter(s => s !== opt) : [...selected, opt])}
                style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #111827' : '1px solid #e5e7eb', background: active ? '#111827' : 'white', color: active ? 'white' : '#374151' }}>
                {opt}
              </button>
            );
          })}
        </div>
        <button onClick={() => setEditing(null)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
      </div>
    </>
  );

  const textSheet = (title: string, value: string, onCh: (v: string) => void, placeholder: string) => (
    <>
      <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p>
        <input type="text" value={value} onChange={e => onCh(e.target.value)} placeholder={placeholder} autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 14 }} />
        <button onClick={() => setEditing(null)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 100, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Back</button>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Details</p>
        <button onClick={onSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>Skip →</button>
      </div>
      {photoUrl && (
        <div style={{ padding: '0 16px 12px' }}>
          <img src={photoUrl} alt="clothing" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '4px 16px 8px' }}><p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>All fields are optional</p></div>

      {row('Material', d.material.length ? d.material.join(', ') : null, 'material')}
      {row('Size', d.sizeLabel || null, 'size')}
      {row('Measurements', (() => {
        const fields = MEASUREMENT_FIELDS[selectedCategory ?? ''] ?? MEASUREMENT_FIELDS._default;
        const filled = fields.filter(f => d.measurements[f]).map(f => `${f} ${d.measurements[f]}`);
        return filled.length ? filled.join(' · ') : null;
      })(), 'measurements')}
      {row('Layer', d.layer, 'layer')}
      {row('Condition', d.condition, 'condition')}
      {row('Brand', d.brand || null, 'brand')}
      {row('Season', d.season.length ? d.season.join(', ') : null, 'season')}
      {row('Notes', d.notes ? (d.notes.length > 30 ? d.notes.slice(0, 30) + '…' : d.notes) : null, 'notes')}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px 28px', background: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={onSave} style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', background: '#111827', color: 'white' }}>Save to Wardrobe</button>
      </div>

      {editing === 'material' && multiChipSheet('Material', MATERIALS, d.material, v => set('material', v))}
      {editing === 'layer' && chipSheet('Layer', LAYERS, d.layer, v => set('layer', v))}
      {editing === 'condition' && chipSheet('Condition', CONDITIONS, d.condition, v => set('condition', v))}
      {editing === 'season' && multiChipSheet('Season', SEASONS, d.season, v => set('season', v))}
      {editing === 'brand' && textSheet('Brand', d.brand, v => set('brand', v), 'e.g. Nike, Zara, Uniqlo…')}
      {editing === 'size' && <SizeSheet category={selectedCategory} value={d.sizeLabel} onChange={v => set('sizeLabel', v)} onClose={() => setEditing(null)} />}
      {editing === 'measurements' && <MeasurementsSheet category={selectedCategory} values={d.measurements} onChange={v => set('measurements', v)} onClose={() => setEditing(null)} />}
      {editing === 'notes' && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Notes</p>
            <textarea value={d.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything worth remembering…" rows={4} autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />
            <button onClick={() => setEditing(null)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-sheets ───────────────────────────────────────────────────

function SizeSheet({ category, value, onChange, onClose }: { category: string | null; value: string; onChange: (v: string) => void; onClose: () => void }) {
  const [sizeType, setSizeType] = useState<SizeType>(() => defaultSizeType(category));
  const [shoeFormat, setShoeFormat] = useState<ShoeFormat>('US');
  const chip = (label: string, active: boolean, onClick: () => void, small = false) => (
    <button key={label} onClick={onClick} style={{ padding: small ? '6px 12px' : '8px 16px', borderRadius: 999, fontSize: small ? 13 : 14, fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #111827' : '1px solid #e5e7eb', background: active ? '#111827' : 'white', color: active ? 'white' : '#374151' }}>{label}</button>
  );
  const sel = (display: string) => onChange(value === display ? '' : display);

  const opts = () => {
    switch (sizeType) {
      case 'one_size': return <div style={{ padding: '8px 0 12px' }}>{chip('One Size', value === 'One Size', () => sel('One Size'))}</div>;
      case 'standard': return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{STANDARD_SIZES.map(s => chip(s, value === s, () => sel(s)))}</div>;
      case 'collar': return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{COLLAR_SIZES.map(s => chip(s, value === `Collar ${s}`, () => sel(`Collar ${s}`), true))}</div>;
      case 'waist': return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{WAIST_SIZES.map(s => chip(s, value === `Waist ${s}`, () => sel(`Waist ${s}`), true))}</div>;
      case 'shoes': return (<>
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {(['US','UK','EU'] as ShoeFormat[]).map(f => <button key={f} onClick={() => { setShoeFormat(f); onChange(''); }} style={{ flex: 1, padding: '8px 0', fontSize: 14, fontWeight: shoeFormat === f ? 600 : 400, cursor: 'pointer', border: 'none', background: shoeFormat === f ? '#111827' : 'white', color: shoeFormat === f ? 'white' : '#374151' }}>{f}</button>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{SHOE_SIZES[shoeFormat].map(s => chip(s, value === `${shoeFormat} ${s}`, () => sel(`${shoeFormat} ${s}`), true))}</div>
      </>);
      case 'ring_watch': return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{WATCH_SIZES.map(s => chip(`${s}mm`, value === `${s}mm`, () => sel(`${s}mm`), true))}</div>;
    }
  };

  return (<>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
      <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Size</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {SIZE_TYPES.map(t => <button key={t.key} onClick={() => { setSizeType(t.key); if (t.key === 'one_size') onChange('One Size'); else onChange(''); }} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: sizeType === t.key ? '1.5px solid #111827' : '1px solid #d1d5db', background: sizeType === t.key ? '#f3f4f6' : 'white', color: sizeType === t.key ? '#111827' : '#6b7280' }}>{t.label}</button>)}
      </div>
      {opts()}
      {sizeType !== 'one_size' && <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Or type a custom size" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 14 }} />}
      <button onClick={onClose} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
    </div>
  </>);
}

function MeasurementsSheet({ category, values, onChange, onClose }: { category: string | null; values: Record<string, string>; onChange: (v: Record<string, string>) => void; onClose: () => void }) {
  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');
  const fields = MEASUREMENT_FIELDS[category ?? ''] ?? MEASUREMENT_FIELDS._default;
  const toggleUnit = () => {
    const next = unit === 'cm' ? 'inch' : 'cm';
    const converted: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (!v) { converted[k] = v; continue; }
      const num = parseFloat(v);
      if (isNaN(num)) { converted[k] = v; continue; }
      converted[k] = next === 'inch' ? (num * 0.3937).toFixed(1) : (num * 2.54).toFixed(1);
    }
    onChange(converted);
    setUnit(next);
  };

  return (<>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Measurements</p>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {(['cm', 'inch'] as const).map(u => <button key={u} onClick={u !== unit ? toggleUnit : undefined} style={{ padding: '5px 14px', fontSize: 13, fontWeight: unit === u ? 600 : 400, cursor: 'pointer', border: 'none', background: unit === u ? '#111827' : 'white', color: unit === u ? 'white' : '#6b7280' }}>{u}</button>)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
        {fields.map(label => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: '#6b7280', width: 120, flexShrink: 0 }}>{label}</span>
            <input type="number" value={values[label] ?? ''} onChange={e => onChange({ ...values, [label]: e.target.value })} placeholder="—" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', width: 30 }}>{unit}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
    </div>
  </>);
}
