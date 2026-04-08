import type { Item, PresetItem, WishlistItem } from '../types';

/**
 * Convert a PresetItem to a new wardrobe Item.
 * Preserves categoryId, subcategoryId, imageUrl, and all fieldValues.
 */
export function presetToItem(preset: PresetItem, newId: string): Item {
  const now = new Date();
  return {
    id: newId,
    categoryId: preset.categoryId,
    subcategoryId: preset.subcategoryId,
    imageUrl: preset.imageUrl,
    fieldValues: { ...preset.fieldValues },
    isFavorite: false,
    usageCount: 0,
    fitConfidence: 'exact',
    materialStretch: false,
    inStorage: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Mark a wishlist item as purchased.
 * Returns the new wardrobe Item if createWardrobeItem is true, otherwise null.
 * Carries over categoryId, subcategoryId, imageUrl, and fieldValues.
 */
export function wishlistToItem(
  wishlistItem: WishlistItem,
  newId: string,
  createWardrobeItem: boolean
): Item | null {
  if (!createWardrobeItem) return null;

  const now = new Date();
  return {
    id: newId,
    categoryId: wishlistItem.categoryId,
    subcategoryId: wishlistItem.subcategoryId,
    imageUrl: wishlistItem.imageUrl,
    fieldValues: { ...wishlistItem.fieldValues },
    isFavorite: false,
    usageCount: 0,
    fitConfidence: 'exact',
    materialStretch: false,
    inStorage: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}
