export interface ColorPreset {
  name: string;
  hex: string;
}

export const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  { name: 'White',       hex: '#ffffff' },
  { name: 'Light Gray',  hex: '#d1d5db' },
  { name: 'Gray',        hex: '#6b7280' },
  { name: 'Dark Gray',   hex: '#374151' },
  { name: 'Black',       hex: '#111827' },
  { name: 'Red',         hex: '#ef4444' },
  { name: 'Pink',        hex: '#ec4899' },
  { name: 'Orange',      hex: '#f97316' },
  { name: 'Yellow',      hex: '#eab308' },
  { name: 'Lime',        hex: '#84cc16' },
  { name: 'Green',       hex: '#22c55e' },
  { name: 'Teal',        hex: '#14b8a6' },
  { name: 'Cyan',        hex: '#06b6d4' },
  { name: 'Blue',        hex: '#3b82f6' },
  { name: 'Indigo',      hex: '#6366f1' },
  { name: 'Purple',      hex: '#a855f7' },
  { name: 'Brown',       hex: '#92400e' },
  { name: 'Beige',       hex: '#d4b896' },
  { name: 'Navy',        hex: '#1e3a5f' },
  { name: 'Olive',       hex: '#6b7c2d' },
];

/** Euclidean distance in RGB space */
function colorDistance(hex1: string, hex2: string): number {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Snap an arbitrary hex color to the nearest preset.
 * If the nearest preset is already in the list, returns it; otherwise returns the closest.
 */
export function snapToPreset(hex: string, presets: ColorPreset[]): ColorPreset {
  return presets.reduce((best, preset) =>
    colorDistance(hex, preset.hex) < colorDistance(hex, best.hex) ? preset : best
  );
}
