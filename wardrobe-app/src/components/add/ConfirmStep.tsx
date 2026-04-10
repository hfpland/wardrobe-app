import { useRef, useState } from 'react';
import { DEFAULT_COLOR_PRESETS, snapToPreset, type ColorPreset } from '../../utils/colorPresets';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Dresses', 'Accessories', 'Sportswear'];

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

interface Props {
  photoUrl: string | null;
  selectedColors: string[];
  setSelectedColors: (v: string[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  onRetake: () => void;
  onDetails: () => void;
  onSave: () => void;
  onCategoryChange?: (cat: string | null) => void;
}

export default function ConfirmStep(p: Props) {
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const [customPresets, setCustomPresets] = useState<ColorPreset[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pendingCustomColor, setPendingCustomColor] = useState<string | null>(null);

  const allPresets = [...DEFAULT_COLOR_PRESETS, ...customPresets];

  function toggleColor(hex: string) {
    p.setSelectedColors(
      p.selectedColors.includes(hex) ? p.selectedColors.filter(c => c !== hex) : [...p.selectedColors, hex]
    );
  }

  function handleCustomColorPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value;
    const nearest = snapToPreset(hex, allPresets);
    const dist = colorDist(hex, nearest.hex);
    if (dist < 30) {
      if (!p.selectedColors.includes(nearest.hex)) p.setSelectedColors([...p.selectedColors, nearest.hex]);
      setPaletteOpen(false);
      return;
    }
    setPendingCustomColor(hex);
  }

  function confirmSavePreset(save: boolean) {
    if (!pendingCustomColor) return;
    if (save) setCustomPresets(prev => [...prev, { name: pendingCustomColor.toUpperCase(), hex: pendingCustomColor }]);
    if (!p.selectedColors.includes(pendingCustomColor)) p.setSelectedColors([...p.selectedColors, pendingCustomColor]);
    setPendingCustomColor(null);
    setPaletteOpen(false);
  }

  async function handleEyeDropper() {
    if (!window.EyeDropper) return;
    try {
      const dropper = new window.EyeDropper();
      const { sRGBHex } = await dropper.open();
      const nearest = snapToPreset(sRGBHex, allPresets);
      if (colorDist(sRGBHex, nearest.hex) < 30) {
        if (!p.selectedColors.includes(nearest.hex)) p.setSelectedColors([...p.selectedColors, nearest.hex]);
        setPaletteOpen(false);
      } else {
        setPendingCustomColor(sRGBHex);
      }
    } catch { /* cancelled */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 100, overflowY: 'auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button onClick={p.onRetake} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Retake</button>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>New Piece</p>
        <button onClick={p.onDetails} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14, fontWeight: 600 }}>Details →</button>
      </div>

      {/* Photo */}
      {p.photoUrl && (
        <div style={{ margin: '0 16px 20px', borderRadius: 16, overflow: 'hidden', height: 240 }}>
          <img src={p.photoUrl} alt="clothing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Category */}
      <div style={{ padding: '0 16px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => {
                const next = cat === p.selectedCategory ? null : cat;
                p.setSelectedCategory(next);
                p.onCategoryChange?.(next);
              }}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: p.selectedCategory === cat ? '1px solid #111827' : '1px solid #e5e7eb', background: p.selectedCategory === cat ? '#111827' : 'white', color: p.selectedCategory === cat ? 'white' : '#374151' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={{ padding: '0 16px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Colors</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {p.selectedColors.map(hex => {
            const preset = allPresets.find(pr => pr.hex === hex);
            return (
              <button key={hex} onClick={() => toggleColor(hex)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 8px', borderRadius: 999, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: hex, border: isLightColor(hex) ? '1px solid #e5e7eb' : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{preset?.name ?? hex}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 2 }}>×</span>
              </button>
            );
          })}
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
        <button onClick={p.onSave} disabled={!p.selectedCategory}
          style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 600, border: 'none', cursor: p.selectedCategory ? 'pointer' : 'not-allowed', background: p.selectedCategory ? '#111827' : '#e5e7eb', color: p.selectedCategory ? 'white' : '#9ca3af' }}>
          Save to Wardrobe
        </button>
      </div>

      {/* Palette sheet */}
      {paletteOpen && (
        <>
          <div onClick={() => setPaletteOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Choose a color</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {allPresets.map(preset => {
                const selected = p.selectedColors.includes(preset.hex);
                return (
                  <button key={preset.hex} onClick={() => { toggleColor(preset.hex); setPaletteOpen(false); }} title={preset.name}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: preset.hex, border: isLightColor(preset.hex) ? '1px solid #e5e7eb' : 'none', boxShadow: selected ? '0 0 0 3px white, 0 0 0 5px #111827' : '0 1px 3px rgba(0,0,0,0.15)' }} />
                    <span style={{ fontSize: 9, color: '#6b7280', maxWidth: 44, textAlign: 'center', lineHeight: 1.2 }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 16px' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => customColorInputRef.current?.click()}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)' }} />
                Custom color
              </button>
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

      {/* Save-preset prompt */}
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

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}

function colorDist(a: string, b: string): number {
  const pr = (h: string, s: number) => parseInt(h.slice(s, s + 2), 16);
  return Math.sqrt(['1','3','5'].reduce((sum, s) => sum + (pr(a,+s) - pr(b,+s)) ** 2, 0));
}
