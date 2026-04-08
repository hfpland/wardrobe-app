/**
 * Extract dominant colors from an image element using canvas.
 * Returns up to `count` hex color strings.
 */
export function extractDominantColors(img: HTMLImageElement, count = 5): string[] {
  const canvas = document.createElement('canvas');
  const size = 100; // downsample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  // Sample every 4th pixel, bucket into 32-step RGB grid
  const buckets = new Map<string, number>();
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });
}
