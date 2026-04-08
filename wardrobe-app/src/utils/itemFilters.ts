import type { Item } from '../types';

export type SortOption = 'newest' | 'oldest' | 'most_used' | 'least_used';

/**
 * Filter items by category and optional subcategory
 */
export function filterByCategory(
  items: Item[],
  categoryId: string,
  subcategoryId?: string
): Item[] {
  return items.filter(item => {
    if (item.categoryId !== categoryId) return false;
    if (subcategoryId && item.subcategoryId !== subcategoryId) return false;
    return true;
  });
}

export function filterByFavorite(items: Item[], favoritesOnly: boolean): Item[] {
  if (!favoritesOnly) return items;
  return items.filter(item => item.isFavorite);
}

/**
 * Search items across all field values (case-insensitive).
 * Optionally scoped to a category/subcategory.
 */
export function searchItems(
  items: Item[],
  searchQuery: string,
  categoryId?: string,
  subcategoryId?: string
): Item[] {
  let filtered = items;

  if (categoryId) filtered = filterByCategory(filtered, categoryId, subcategoryId);

  if (!searchQuery.trim()) return filtered;

  const query = searchQuery.toLowerCase();
  return filtered.filter(item =>
    Object.values(item.fieldValues).some(value => fieldValueContainsQuery(value, query))
  );
}

/**
 * Sort items by specified criteria. Returns a new array.
 */
export function sortItems(items: Item[], sortBy: SortOption): Item[] {
  const copy = [...items];

  switch (sortBy) {
    case 'newest':
      return copy.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    case 'oldest':
      return copy.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
    case 'most_used':
      return copy.sort((a, b) => b.usageCount - a.usageCount);
    case 'least_used':
      return copy.sort((a, b) => a.usageCount - b.usageCount);
  }
}

/**
 * Check if a field value contains the search query string.
 */
function fieldValueContainsQuery(value: unknown, query: string): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.toLowerCase().includes(query);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).toLowerCase().includes(query);
  if (Array.isArray(value)) return value.some(el => fieldValueContainsQuery(el, query));
  // MeasurementValue or other objects — skip
  return false;
}
