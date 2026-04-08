import type { Item } from '../types';

export interface CategoryBreakdown {
  categoryId: string;
  count: number;
}

export interface WardrobeStats {
  totalItems: number;
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Compute total item count and per-category breakdown.
 * Excludes deleted and storage items from active count.
 */
export function computeWardrobeStats(items: Item[]): WardrobeStats {
  const active = items.filter(item => !item.isDeleted);

  const countMap = new Map<string, number>();
  for (const item of active) {
    countMap.set(item.categoryId, (countMap.get(item.categoryId) ?? 0) + 1);
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(countMap.entries()).map(
    ([categoryId, count]) => ({ categoryId, count })
  );

  return {
    totalItems: active.length,
    categoryBreakdown,
  };
}

/**
 * Get item count for a specific category.
 */
export function countByCategory(items: Item[], categoryId: string): number {
  return items.filter(item => !item.isDeleted && item.categoryId === categoryId).length;
}
