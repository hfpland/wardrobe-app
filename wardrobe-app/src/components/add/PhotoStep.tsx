import { useRef } from 'react';

interface Props {
  onPhotoSelected: (file: File, url: string) => void;
  onCancel: () => void;
}

export default function PhotoStep({ onPhotoSelected, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onPhotoSelected(file, url);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#000', position: 'relative' }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer', zIndex: 10 }}>
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
