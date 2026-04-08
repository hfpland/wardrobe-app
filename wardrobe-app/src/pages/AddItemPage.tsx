import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractDominantColors } from '../utils/colorDetect';
import { DEFAULT_COLOR_PRESETS, snapToPreset, type ColorPreset } from '../utils/colorPresets';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Dresses', 'Accessories', 'Sportswear'];

type Step = 'photo' | 'confirm' | 'details';

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

export default function AddItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customColorInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('photo');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<ColorPreset[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Details (optional)
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [material, setMaterial] = useState<string[]>([]);
  const [sizeLabel, setSizeLabel] = useState('');
  const [layer, setLayer] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [season, setSeason] = useState<string[]>([]);

  // Palette sheet state
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Save-preset prompt state
  const [pendingCustomColor, setPendingCustomColor] = useState<string | null>(null);

  const allPresets = [...DEFAULT_COLOR_PRESETS, ...customPresets];

  // ── Photo handling ─────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    const img = new Image();
    img.onload = () => {
      const raw = extractDominantColors(img, 8);
      const snapped = Array.from(
        new Set(raw.map(hex => snapToPreset(hex, allPresets).hex))
      ).slice(0, 3);
      setSelectedColors(snapped);
      setStep('confirm');
    };
    img.src = url;
  }

  // ── Color selection ────────────────────────────────────────────
  function toggleColor(hex: string) {
    setSelectedColors(prev =>
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    );
  }

  // ── Custom color from native picker ───────────────────────────
  function handleCustomColorPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value;
    // Check if it's close enough to an existing preset
    const nearest = snapToPreset(hex, allPresets);
    const dist = colorDist(hex, nearest.hex);
    if (dist < 30) {
      // Just select the nearest preset, no need to save
      if (!selectedColors.includes(nearest.hex)) {
        setSelectedColors(prev => [...prev, nearest.hex]);
      }
      setPaletteOpen(false);
      return;
    }
    // It's a genuinely new color — ask to save
    setPendingCustomColor(hex);
  }

  function confirmSavePreset(save: boolean) {
    if (!pendingCustomColor) return;
    if (save) {
      const newPreset: ColorPreset = { name: pendingCustomColor.toUpperCase(), hex: pendingCustomColor };
      setCustomPresets(prev => [...prev, newPreset]);
    }
    setSelectedColors(prev =>
      prev.includes(pendingCustomColor) ? prev : [...prev, pendingCustomColor]
    );
    setPendingCustomColor(null);
    setPaletteOpen(false);
  }

  async function handleEyeDropper() {
    if (!window.EyeDropper) return;
    try {
      const dropper = new window.EyeDropper();
      const { sRGBHex } = await dropper.open();
      const nearest = snapToPreset(sRGBHex, allPresets);
      const dist = colorDist(sRGBHex, nearest.hex);
      if (dist < 30) {
        if (!selectedColors.includes(nearest.hex)) setSelectedColors(prev => [...prev, nearest.hex]);
        setPaletteOpen(false);
      } else {
        setPendingCustomColor(sRGBHex);
      }
    } catch { /* cancelled */ }
  }

  function handleSave() {
    navigate('/wardrobe');
  }

  // ── Step 3: Details (optional) ────────────────────────────────
  if (step === 'details') {
    return (
      <DetailsStep
        photoUrl={photoUrl}
        selectedCategory={selectedCategory}
        brand={brand} setBrand={setBrand}
        season={season} setSeason={setSeason}
        notes={notes} setNotes={setNotes}
        material={material} setMaterial={setMaterial}
        sizeLabel={sizeLabel} setSizeLabel={setSizeLabel}
        layer={layer} setLayer={setLayer}
        condition={condition} setCondition={setCondition}
        measurements={measurements} setMeasurements={setMeasurements}
        onBack={() => setStep('confirm')}
        onSave={handleSave}
      />
    );
  }

  // ── Step 1: Photo ──────────────────────────────────────────────
  if (step === 'photo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#000', position: 'relative' }}>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer', zIndex: 10 }}>
          Cancel
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} style={{ width: 36, height: 36 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>Add a piece</p>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Take a photo or choose from gallery</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'white', color: '#111827', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Take Photo
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                  setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 500);
                }
              }}
              style={{ background: '#1f2937', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              Choose from Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Confirm ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 100, overflowY: 'auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button onClick={() => setStep('photo')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Retake</button>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>New Piece</p>
        <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14, fontWeight: 600 }}>Details →</button>
      </div>
      {photoUrl && (
        <div style={{ margin: '0 16px 20px', borderRadius: 16, overflow: 'hidden', height: 240 }}>
          <img src={photoUrl} alt="clothing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Category */}
      <div style={{ padding: '0 16px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => {
                const next = cat === selectedCategory ? null : cat;
                setSelectedCategory(next);
                setMeasurements({});
                setSizeLabel('');
              }}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: selectedCategory === cat ? '1px solid #111827' : '1px solid #e5e7eb', background: selectedCategory === cat ? '#111827' : 'white', color: selectedCategory === cat ? 'white' : '#374151' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Colors — compact row */}
      <div style={{ padding: '0 16px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Colors</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Selected color chips */}
          {selectedColors.map(hex => {
            const preset = allPresets.find(p => p.hex === hex);
            return (
              <button key={hex} onClick={() => toggleColor(hex)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 8px', borderRadius: 999, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: hex, border: isLightColor(hex) ? '1px solid #e5e7eb' : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{preset?.name ?? hex}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 2 }}>×</span>
              </button>
            );
          })}

          {/* + Add color button */}
          <button onClick={() => setPaletteOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: '1.5px dashed #d1d5db', background: 'white', cursor: 'pointer', color: '#6b7280', fontSize: 13 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add color
          </button>
        </div>
      </div>

      {/* Save */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px 28px', background: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={handleSave} disabled={!selectedCategory}
          style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 600, border: 'none', cursor: selectedCategory ? 'pointer' : 'not-allowed', background: selectedCategory ? '#111827' : '#e5e7eb', color: selectedCategory ? 'white' : '#9ca3af' }}>
          Save to Wardrobe
        </button>
      </div>

      {/* ── Palette bottom sheet ─────────────────────────────── */}
      {paletteOpen && (
        <>
          {/* Backdrop — covers navbar too */}
          <div onClick={() => setPaletteOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />

          {/* Sheet — above backdrop and navbar */}
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />

            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Choose a color</p>

            {/* Preset grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {allPresets.map(preset => {
                const selected = selectedColors.includes(preset.hex);
                return (
                  <button key={preset.hex} onClick={() => { toggleColor(preset.hex); setPaletteOpen(false); }} title={preset.name}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: preset.hex, border: isLightColor(preset.hex) ? '1px solid #e5e7eb' : 'none', boxShadow: selected ? '0 0 0 3px white, 0 0 0 5px #111827' : '0 1px 3px rgba(0,0,0,0.15)' }} />
                    <span style={{ fontSize: 9, color: '#6b7280', maxWidth: 44, textAlign: 'center', lineHeight: 1.2 }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 16px' }} />

            {/* Actions row */}
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Custom color picker */}
              <button onClick={() => customColorInputRef.current?.click()}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)' }} />
                Custom color
              </button>

              {/* EyeDropper */}
              {typeof window !== 'undefined' && window.EyeDropper && (
                <button onClick={handleEyeDropper}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78z" />
                    <line x1="15.5" y1="8.5" x2="18.5" y2="11.5" />
                  </svg>
                  Eyedrop
                </button>
              )}
            </div>

            <input ref={customColorInputRef} type="color" style={{ display: 'none' }} onChange={handleCustomColorPicked} />
          </div>
        </>
      )}

      {/* ── Save-preset prompt ───────────────────────────────── */}
      {pendingCustomColor && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 120 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 130, padding: '24px 16px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: pendingCustomColor, border: isLightColor(pendingCustomColor) ? '1px solid #e5e7eb' : 'none', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15 }}>Save to your color presets?</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>This color will appear in your palette next time.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => confirmSavePreset(false)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                Just this once
              </button>
              <button onClick={() => confirmSavePreset(true)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white' }}>
                Save to presets
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Step 3: Optional details ─────────────────────────────────────
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
  US: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14', '15'],
  UK: ['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13', '14'],
  EU: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
};
const WATCH_SIZES = ['36', '38', '40', '42', '44', '46'];

function defaultSizeType(category: string | null): SizeType {
  switch (category) {
    case 'Tops': return 'standard';
    case 'Bottoms': return 'waist';
    case 'Shoes': return 'shoes';
    case 'Accessories': return 'ring_watch';
    case 'Dresses': return 'standard';
    default: return 'standard';
  }
}

interface DetailsProps {
  photoUrl: string | null;
  selectedCategory: string | null;
  brand: string; setBrand: (v: string) => void;
  season: string[]; setSeason: (v: string[]) => void;
  notes: string; setNotes: (v: string) => void;
  material: string[]; setMaterial: (v: string[]) => void;
  sizeLabel: string; setSizeLabel: (v: string) => void;
  layer: string | null; setLayer: (v: string | null) => void;
  condition: string | null; setCondition: (v: string | null) => void;
  measurements: Record<string, string>; setMeasurements: (v: Record<string, string>) => void;
  onBack: () => void; onSave: () => void;
}

type EditField = 'material' | 'size' | 'measurements' | 'layer' | 'condition' | 'brand' | 'season' | 'notes' | null;

const penIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

function DetailsStep(p: DetailsProps) {
  const [editing, setEditing] = useState<EditField>(null);

  const row = (label: string, value: string | null | undefined, field: EditField) => (
    <button onClick={() => setEditing(field)}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
      <span style={{ fontSize: 14, color: '#6b7280', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value || '—'}
      </span>
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
        <button onClick={() => setEditing(null)}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </>
  );

  const textSheet = (title: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <>
      <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>{title}</p>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 14 }} />
        <button onClick={() => setEditing(null)}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 100, overflowY: 'auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button onClick={p.onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Back</button>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Details</p>
        <button onClick={p.onSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>Skip →</button>
      </div>
      {/* Photo thumbnail */}
      {p.photoUrl && (
        <div style={{ padding: '0 16px 12px' }}>
          <img src={p.photoUrl} alt="clothing" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '4px 16px 8px' }}>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>All fields are optional</p>
      </div>

    
      {/* Rows */}
      {row('Material', p.material.length ? p.material.join(', ') : null, 'material')}
      {row('Size', p.sizeLabel || null, 'size')}
      {row('Measurements', (() => {
        const fields = MEASUREMENT_FIELDS[p.selectedCategory ?? ''] ?? MEASUREMENT_FIELDS._default;
        const filled = fields.filter(f => p.measurements[f]).map(f => `${f} ${p.measurements[f]}`);
        return filled.length ? filled.join(' · ') : null;
      })(), 'measurements')}
      {row('Layer', p.layer, 'layer')}
      {row('Condition', p.condition, 'condition')}
      {row('Brand', p.brand || null, 'brand')}
      {row('Season', p.season.length ? p.season.join(', ') : null, 'season')}
      {row('Notes', p.notes ? (p.notes.length > 30 ? p.notes.slice(0, 30) + '…' : p.notes) : null, 'notes')}

      {/* Save */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px 28px', background: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={p.onSave}
          style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', background: '#111827', color: 'white' }}>
          Save to Wardrobe
        </button>
      </div>

      {/* Bottom sheets */}
      {editing === 'material' && multiChipSheet('Material', MATERIALS, p.material, p.setMaterial)}
      {editing === 'layer' && chipSheet('Layer', LAYERS, p.layer, p.setLayer)}
      {editing === 'condition' && chipSheet('Condition', CONDITIONS, p.condition, p.setCondition)}
      {editing === 'season' && multiChipSheet('Season', SEASONS, p.season, p.setSeason)}
      {editing === 'brand' && textSheet('Brand', p.brand, p.setBrand, 'e.g. Nike, Zara, Uniqlo…')}

      {/* Size sheet — category-aware */}
      {editing === 'size' && <SizeSheet
        category={p.selectedCategory}
        value={p.sizeLabel}
        onChange={p.setSizeLabel}
        onClose={() => setEditing(null)}
      />}

      {/* Measurements sheet */}
      {editing === 'measurements' && <MeasurementsSheet
        category={p.selectedCategory}
        values={p.measurements}
        onChange={p.setMeasurements}
        onClose={() => setEditing(null)}
      />}

      {/* Notes sheet */}
      {editing === 'notes' && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Notes</p>
            <textarea value={p.notes} onChange={e => p.setNotes(e.target.value)} placeholder="Anything worth remembering…" rows={4} autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />
            <button onClick={() => setEditing(null)}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const MEASUREMENT_FIELDS: Record<string, string[]> = {
  Tops: ['Body width', 'Body length', 'Sleeve length', 'Shoulder width'],
  Bottoms: ['Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh'],
  Dresses: ['Bust', 'Waist', 'Hip', 'Length', 'Sleeve length'],
  Shoes: ['Insole length', 'Foot width'],
  Accessories: ['Diameter', 'Length', 'Width'],
  Sportswear: ['Body width', 'Body length', 'Sleeve length', 'Inseam'],
  _default: ['Length', 'Width', 'Height'],
};

function MeasurementsSheet({ category, values, onChange, onClose }: {
  category: string | null;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');
  const fields = MEASUREMENT_FIELDS[category ?? ''] ?? MEASUREMENT_FIELDS._default;

  const toggleUnit = () => {
    const next = unit === 'cm' ? 'inch' : 'cm';
    // Convert existing values
    const converted: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (!v) { converted[k] = v; continue; }
      const num = parseFloat(v);
      if (isNaN(num)) { converted[k] = v; continue; }
      converted[k] = next === 'inch'
        ? (num * 0.3937).toFixed(1)
        : (num * 2.54).toFixed(1);
    }
    onChange(converted);
    setUnit(next);
  };

  const setField = (label: string, val: string) => {
    onChange({ ...values, [label]: val });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Title + unit toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Measurements</p>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {(['cm', 'inch'] as const).map(u => (
              <button key={u} onClick={u !== unit ? toggleUnit : undefined}
                style={{ padding: '5px 14px', fontSize: 13, fontWeight: unit === u ? 600 : 400, cursor: 'pointer', border: 'none', background: unit === u ? '#111827' : 'white', color: unit === u ? 'white' : '#6b7280' }}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
          {fields.map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#6b7280', width: 120, flexShrink: 0 }}>{label}</span>
              <input type="number" value={values[label] ?? ''} onChange={e => setField(label, e.target.value)} placeholder="—"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', width: 30 }}>{unit}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </>
  );
}

function SizeSheet({ category, value, onChange, onClose }: { category: string | null; value: string; onChange: (v: string) => void; onClose: () => void }) {
  const [sizeType, setSizeType] = useState<SizeType>(() => defaultSizeType(category));
  const [shoeFormat, setShoeFormat] = useState<ShoeFormat>('US');

  const chipBtn = (label: string, active: boolean, onClick: () => void, small = false) => (
    <button key={label} onClick={onClick}
      style={{ padding: small ? '6px 12px' : '8px 16px', borderRadius: 999, fontSize: small ? 13 : 14, fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #111827' : '1px solid #e5e7eb', background: active ? '#111827' : 'white', color: active ? 'white' : '#374151' }}>
      {label}
    </button>
  );

  const selectSize = (display: string) => {
    onChange(value === display ? '' : display);
  };

  const renderSizeOptions = () => {
    switch (sizeType) {
      case 'one_size':
        return (
          <div style={{ padding: '8px 0 12px' }}>
            {chipBtn('One Size', value === 'One Size', () => selectSize('One Size'))}
          </div>
        );
      case 'standard':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {STANDARD_SIZES.map(s => chipBtn(s, value === s, () => selectSize(s)))}
          </div>
        );
      case 'collar':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {COLLAR_SIZES.map(s => {
              const label = `Collar ${s}`;
              return chipBtn(s, value === label, () => selectSize(label), true);
            })}
          </div>
        );
      case 'waist':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {WAIST_SIZES.map(s => {
              const label = `Waist ${s}`;
              return chipBtn(s, value === label, () => selectSize(label), true);
            })}
          </div>
        );
      case 'shoes':
        return (
          <>
            {/* Format toggle */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {(['US', 'UK', 'EU'] as ShoeFormat[]).map(fmt => (
                <button key={fmt} onClick={() => { setShoeFormat(fmt); onChange(''); }}
                  style={{ flex: 1, padding: '8px 0', fontSize: 14, fontWeight: shoeFormat === fmt ? 600 : 400, cursor: 'pointer', border: 'none', background: shoeFormat === fmt ? '#111827' : 'white', color: shoeFormat === fmt ? 'white' : '#374151' }}>
                  {fmt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {SHOE_SIZES[shoeFormat].map(s => {
                const label = `${shoeFormat} ${s}`;
                return chipBtn(s, value === label, () => selectSize(label), true);
              })}
            </div>
          </>
        );
      case 'ring_watch':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {WATCH_SIZES.map(s => {
              const label = `${s}mm`;
              return chipBtn(label, value === label, () => selectSize(label), true);
            })}
          </div>
        );
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Size</p>

        {/* Size type selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {SIZE_TYPES.map(t => (
            <button key={t.key} onClick={() => { setSizeType(t.key); if (t.key === 'one_size') { onChange('One Size'); } else { onChange(''); } }}
              style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: sizeType === t.key ? '1.5px solid #111827' : '1px solid #d1d5db', background: sizeType === t.key ? '#f3f4f6' : 'white', color: sizeType === t.key ? '#111827' : '#6b7280' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Size options */}
        {renderSizeOptions()}

        {/* Custom input */}
        {sizeType !== 'one_size' && (
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder="Or type a custom size"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 15, outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 14 }} />
        )}

        <button onClick={onClose}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#111827', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}

function colorDist(a: string, b: string): number {
  const p = (h: string, s: number) => parseInt(h.slice(s, s + 2), 16);
  return Math.sqrt(['1','3','5'].reduce((sum, s) => sum + (p(a,+s) - p(b,+s)) ** 2, 0));
}
