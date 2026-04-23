import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWardrobeSetup, saveWardrobeSetup, type WardrobeSetup } from '../services/wardrobeSetup';

const DEFAULT_SIZE_TYPES = ['Standard', 'Collar', 'Shoes', 'Waist', 'Ring / Watch', 'One Size'];
const DEFAULT_MATERIALS = ['Cotton', 'Denim', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Leather', 'Chambray', 'Fleece', 'Knit'];
const DEFAULT_LAYERS = ['Inner', 'Outer', 'Both'];

type SectionKey = 'customSizeTypes' | 'customMaterials' | 'customLayers';
type SectionId = 'sizes' | 'materials' | 'layers';
type ConfirmTarget = { type: 'section'; section: SectionKey; label: string } | { type: 'all' } | null;

const EMPTY_SETUP: WardrobeSetup = { customSizeTypes: [], customMaterials: [], customLayers: [] };

export default function WardrobeSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState<WardrobeSetup>(EMPTY_SETUP);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  const hasAnyCustom = setup.customSizeTypes.length > 0 || setup.customMaterials.length > 0 || setup.customLayers.length > 0;

  useEffect(() => {
    if (!user) return;
    getWardrobeSetup(user.uid).then(data => { setSetup(data); setLoading(false); });
  }, [user]);

  async function addItem(section: SectionKey, defaults: string[]) {
    const trimmed = newValue.trim();
    if (!trimmed || !user) return;
    const allExisting = [...defaults, ...setup[section]];
    if (allExisting.some(v => v.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = { ...setup, [section]: [...setup[section], trimmed] };
    setSaving(true);
    await saveWardrobeSetup(user.uid, updated);
    setSetup(updated);
    setNewValue('');
    setSaving(false);
  }

  async function removeItem(section: SectionKey, value: string) {
    if (!user) return;
    const updated = { ...setup, [section]: setup[section].filter(v => v !== value) };
    await saveWardrobeSetup(user.uid, updated);
    setSetup(updated);
  }

  async function resetSection(section: SectionKey) {
    if (!user) return;
    const updated = { ...setup, [section]: [] };
    await saveWardrobeSetup(user.uid, updated);
    setSetup(updated);
    setConfirmTarget(null);
  }

  async function resetAll() {
    if (!user) return;
    await saveWardrobeSetup(user.uid, EMPTY_SETUP);
    setSetup(EMPTY_SETUP);
    setConfirmTarget(null);
  }

  if (loading) return <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p></div>;

  const sectionRow = (label: string, count: number, section: SectionId) => (
    <button onClick={() => { setActiveSection(activeSection === section ? null : section); setNewValue(''); }}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#111827' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#9ca3af' }}>{count} items</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 16, height: 16, transform: activeSection === section ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );

  const chipList = (defaults: string[], custom: string[], section: SectionKey, defaultsList: string[], sectionLabel: string) => (
    <div style={{ padding: '12px 16px 16px', borderBottom: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {defaults.map(v => (
          <div key={v} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: '#f3f4f6', color: '#6b7280' }}>{v}</div>
        ))}
      </div>
      {custom.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom</p>
            <button onClick={() => setConfirmTarget({ type: 'section', section, label: sectionLabel })}
              style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Reset
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {custom.map(v => (
              <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: '#111827', color: 'white' }}>
                {v}
                <button onClick={() => removeItem(section, v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'white', opacity: 0.7 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 14, height: 14 }}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Add new…"
          onKeyDown={e => { if (e.key === 'Enter') addItem(section, defaultsList); }}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fafafa', boxSizing: 'border-box', caretColor: '#111827' }} />
        <button onClick={() => addItem(section, defaultsList)} disabled={saving || !newValue.trim()}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: newValue.trim() ? '#111827' : '#e5e7eb', color: newValue.trim() ? 'white' : '#9ca3af', fontSize: 14, fontWeight: 600, cursor: newValue.trim() ? 'pointer' : 'not-allowed' }}>
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'white', paddingBottom: 80, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14 }}>← Back</button>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Wardrobe Setup</p>
      </div>
      <div style={{ padding: '4px 16px 16px' }}>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Add custom size types, materials, and layers that will appear when adding or editing items.</p>
      </div>

      {sectionRow('Size Types', DEFAULT_SIZE_TYPES.length + setup.customSizeTypes.length, 'sizes')}
      {activeSection === 'sizes' && chipList(DEFAULT_SIZE_TYPES, setup.customSizeTypes, 'customSizeTypes', DEFAULT_SIZE_TYPES, 'size types')}

      {sectionRow('Materials', DEFAULT_MATERIALS.length + setup.customMaterials.length, 'materials')}
      {activeSection === 'materials' && chipList(DEFAULT_MATERIALS, setup.customMaterials, 'customMaterials', DEFAULT_MATERIALS, 'materials')}

      {sectionRow('Layers', DEFAULT_LAYERS.length + setup.customLayers.length, 'layers')}
      {activeSection === 'layers' && chipList(DEFAULT_LAYERS, setup.customLayers, 'customLayers', DEFAULT_LAYERS, 'layers')}

      {/* Reset All — only shown when there are any custom values */}
      {hasAnyCustom && (
        <div style={{ padding: '24px 16px 0' }}>
          <button onClick={() => setConfirmTarget({ type: 'all' })}
            style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Reset All Custom Settings
          </button>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmTarget && (
        <>
          <div onClick={() => setConfirmTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'calc(100% - 48px)', maxWidth: 340, background: 'white', borderRadius: 20, zIndex: 210, padding: '28px 24px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
              {confirmTarget.type === 'all' ? 'Reset all settings?' : `Reset custom ${confirmTarget.label}?`}
            </p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
              {confirmTarget.type === 'all'
                ? 'This will remove all custom size types, materials, and layers. Items that already use them won\'t be affected.'
                : `This will remove all custom ${confirmTarget.label}. Items that already use them won't be affected.`}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmTarget(null)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={() => confirmTarget.type === 'all' ? resetAll() : resetSection(confirmTarget.section)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white' }}>
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
