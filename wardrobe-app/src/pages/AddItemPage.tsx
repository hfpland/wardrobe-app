import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractDominantColors } from '../utils/colorDetect';
import { DEFAULT_COLOR_PRESETS, snapToPreset } from '../utils/colorPresets';
import { uploadItemImage } from '../services/imageUpload';
import { createItem } from '../services/firestoreItems';
import { useAuth } from '../contexts/AuthContext';
import { getWardrobeSetup } from '../services/wardrobeSetup';
import PhotoStep from '../components/add/PhotoStep';
import ConfirmStep from '../components/add/ConfirmStep';
import DetailsStep, { type DetailsData } from '../components/add/DetailsStep';

type Step = 'photo' | 'confirm' | 'details';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('photo');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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
    setPhotoFile(file);
    setPhotoUrl(url);
    // Extract and snap colors
    const img = new Image();
    img.onload = () => {
      const raw = extractDominantColors(img, 8);
      const snapped = Array.from(
        new Set(raw.map(hex => snapToPreset(hex, DEFAULT_COLOR_PRESETS).hex))
      ).slice(0, 3);
      setSelectedColors(snapped);
      setStep('confirm');
    };
    img.src = url;
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
          <div style={{ background: 'white', borderRadius: 16, padding: '24px 32px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#111827' }}>Uploading…</p>
          </div>
        </div>
      )}
    </>
  );
}
