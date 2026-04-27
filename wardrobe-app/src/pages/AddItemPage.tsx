import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractDominantColors } from '../utils/colorDetect';
import { DEFAULT_COLOR_PRESETS, snapToPreset } from '../utils/colorPresets';
import { uploadItemImage } from '../services/imageUpload';
import { createItem } from '../services/firestoreItems';
import { useAuth } from '../contexts/AuthContext';
import { getWardrobeSetup } from '../services/wardrobeSetup';
import { removeBackground } from '../services/backgroundRemoval';
import PhotoStep from '../components/add/PhotoStep';
import ConfirmStep from '../components/add/ConfirmStep';
import DetailsStep, { type DetailsData } from '../components/add/DetailsStep';

type Step = 'photo' | 'bg-remove' | 'confirm' | 'details';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('photo');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customMaterials, setCustomMaterials] = useState<string[]>([]);
  const [customLayers, setCustomLayers] = useState<string[]>([]);

  const [details, setDetails] = useState<DetailsData>({
    name: '', brand: '', season: [], notes: '', material: [],
    sizeLabel: '', layer: null, condition: null, measurements: {},
  });

  useEffect(() => {
    if (!user) return;
    getWardrobeSetup(user.uid).then(setup => {
      setCustomMaterials(setup.customMaterials);
      setCustomLayers(setup.customLayers);
    });
  }, [user]);

  function handlePhotoSelected(file: File, url: string) {
    setOriginalFile(file);
    setOriginalUrl(url);
    setPhotoFile(file);
    setPhotoUrl(url);
    setProcessedFile(null);
    setProcessedUrl(null);
    setBgFailed(false);
    setStep('bg-remove');
    setBgRemoving(true);

    // Start background removal
    removeBackground(file).then(result => {
      setBgRemoving(false);
      if (result) {
        setProcessedFile(result.file);
        setProcessedUrl(result.url);
        // Default to processed version
        setPhotoFile(result.file);
        setPhotoUrl(result.url);
      } else {
        setBgFailed(true);
      }
    });
  }

  function proceedToConfirm() {
    if (!photoUrl) return;
    const img = new Image();
    img.onload = () => {
      const raw = extractDominantColors(img, 8);
      const snapped = Array.from(
        new Set(raw.map(hex => snapToPreset(hex, DEFAULT_COLOR_PRESETS).hex))
      ).slice(0, 3);
      setSelectedColors(snapped);
      setStep('confirm');
    };
    img.src = photoUrl;
  }

  function selectOriginal() {
    setPhotoFile(originalFile);
    setPhotoUrl(originalUrl);
  }

  function selectProcessed() {
    if (processedFile && processedUrl) {
      setPhotoFile(processedFile);
      setPhotoUrl(processedUrl);
    }
  }

  function handleCategoryChange() {
    setDetails(d => ({ ...d, measurements: {}, sizeLabel: '' }));
  }

  async function handleSave() {
    if (!user || !photoFile || !selectedCategory) return;
    setSaving(true);
    try {
      const imageUrl = await uploadItemImage(user.uid, photoFile);
      await createItem(user.uid, {
        name: details.name ?? '',
        categoryId: selectedCategory,
        imageUrl,
        colors: selectedColors,
        brand: details.brand,
        season: details.season,
        notes: details.notes,
        material: details.material,
        tags: [],
        sizeLabel: details.sizeLabel,
        layer: details.layer,
        condition: details.condition,
        measurements: details.measurements,
      });
      navigate('/wardrobe');
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }

  if (step === 'photo') {
    return <PhotoStep onPhotoSelected={handlePhotoSelected} onCancel={() => navigate(-1)} />;
  }

  if (step === 'bg-remove') {
    const isProcessedSelected = photoUrl === processedUrl && processedUrl !== null;
    const isOriginalSelected = photoUrl === originalUrl;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg)' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <button onClick={() => setStep('photo')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>← Retake</button>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Background</p>
          <button onClick={proceedToConfirm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>Next →</button>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 20 }}>
          {bgRemoving ? (
            <>
              <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                <img src={originalUrl!} alt="original" style={{ width: '100%', borderRadius: 16, display: 'block', opacity: 0.5 }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, animation: 'spin 1s linear infinite', margin: '0 auto 8px', display: 'block' }}>
                      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeDasharray="50 20" />
                    </svg>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Removing background…</p>
                  </div>
                </div>
              </div>
              <button onClick={proceedToConfirm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13 }}>
                Skip and use original
              </button>
            </>
          ) : bgFailed ? (
            <>
              <img src={originalUrl!} alt="original" style={{ width: '100%', maxWidth: 300, borderRadius: 16, display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                Background removal unavailable. Using original photo.
              </p>
            </>
          ) : (
            <>
              {/* Side by side comparison */}
              <div style={{ display: 'flex', gap: 12, width: '100%', padding: '0 8px' }}>
                {/* Original */}
                <button onClick={selectOriginal} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div style={{ borderRadius: 14, overflow: 'hidden', border: isOriginalSelected ? '3px solid var(--text)' : '3px solid transparent', transition: 'border 0.15s' }}>
                    <img src={originalUrl!} alt="original" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: isOriginalSelected ? 600 : 400, color: isOriginalSelected ? 'var(--text)' : 'var(--text-tertiary)', margin: '8px 0 0', textAlign: 'center' }}>Original</p>
                </button>
                {/* Processed */}
                <button onClick={selectProcessed} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div style={{ borderRadius: 14, overflow: 'hidden', border: isProcessedSelected ? '3px solid var(--text)' : '3px solid transparent', background: 'var(--bg-tertiary)', transition: 'border 0.15s' }}>
                    <img src={processedUrl!} alt="background removed" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'contain', display: 'block' }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: isProcessedSelected ? 600 : 400, color: isProcessedSelected ? 'var(--text)' : 'var(--text-tertiary)', margin: '8px 0 0', textAlign: 'center' }}>No background</p>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom button */}
        {!bgRemoving && (
          <div style={{ padding: '12px 16px 28px' }}>
            <button onClick={proceedToConfirm}
              style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--text)', color: 'var(--bg)' }}>
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'details') {
    return (
      <DetailsStep
        photoUrl={photoUrl}
        selectedCategory={selectedCategory}
        data={details}
        onChange={setDetails}
        onBack={() => setStep('confirm')}
        onSave={handleSave}
        saving={saving}
        customMaterials={customMaterials}
        customLayers={customLayers}
      />
    );
  }

  return (
    <>
      <ConfirmStep
        photoUrl={photoUrl}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onRetake={() => setStep('photo')}
        onDetails={() => setStep('details')}
        onSave={handleSave}
        onCategoryChange={handleCategoryChange}
      />
      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '24px 32px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Uploading…</p>
          </div>
        </div>
      )}
    </>
  );
}
