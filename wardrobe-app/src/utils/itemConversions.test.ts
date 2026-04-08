import { describe, it, expect } from 'vitest';
import { presetToItem, wishlistToItem } from './itemConversions';
import type { PresetItem, WishlistItem } from '../types';

const mockPreset: PresetItem = {
  id: 'preset-1',
  name: 'Basic Tee',
  categoryId: 'cat_tops',
  subcategoryId: 'sub_tshirts',
  imageUrl: 'https://example.com/tee.jpg',
  fieldValues: {
    field_name: 'Basic Tee',
    field_brand: 'Nike',
    field_colors: ['#FFFFFF'],
  },
};

const mockWishlistItem: WishlistItem = {
  id: 'wish-1',
  categoryId: 'cat_bottoms',
  subcategoryId: 'sub_jeans',
  imageUrl: 'https://example.com/jeans.jpg',
  fieldValues: {
    field_name: 'Slim Jeans',
    field_brand: "Levi's",
  },
  createdAt: new Date('2024-01-01'),
};

describe('presetToItem', () => {
  it('preserves categoryId and subcategoryId', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    expect(item.categoryId).toBe(mockPreset.categoryId);
    expect(item.subcategoryId).toBe(mockPreset.subcategoryId);
  });

  it('preserves all fieldValues', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    expect(item.fieldValues).toEqual(mockPreset.fieldValues);
  });

  it('preserves imageUrl', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    expect(item.imageUrl).toBe(mockPreset.imageUrl);
  });

  it('assigns the provided new id', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    expect(item.id).toBe('new-id-1');
  });

  it('sets default item state', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    expect(item.isFavorite).toBe(false);
    expect(item.usageCount).toBe(0);
    expect(item.isDeleted).toBe(false);
    expect(item.inStorage).toBe(false);
  });

  it('sets createdAt and updatedAt to now', () => {
    const before = new Date();
    const item = presetToItem(mockPreset, 'new-id-1');
    const after = new Date();
    expect(item.createdAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(item.createdAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(item.updatedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('does not mutate the original preset fieldValues', () => {
    const item = presetToItem(mockPreset, 'new-id-1');
    item.fieldValues['field_name'] = 'Modified';
    expect(mockPreset.fieldValues['field_name']).toBe('Basic Tee');
  });
});

describe('wishlistToItem', () => {
  it('returns null when createWardrobeItem is false', () => {
    const result = wishlistToItem(mockWishlistItem, 'new-id-2', false);
    expect(result).toBeNull();
  });

  it('returns an Item when createWardrobeItem is true', () => {
    const result = wishlistToItem(mockWishlistItem, 'new-id-2', true);
    expect(result).not.toBeNull();
  });

  it('carries over categoryId, subcategoryId, imageUrl, and fieldValues', () => {
    const item = wishlistToItem(mockWishlistItem, 'new-id-2', true)!;
    expect(item.categoryId).toBe(mockWishlistItem.categoryId);
    expect(item.subcategoryId).toBe(mockWishlistItem.subcategoryId);
    expect(item.imageUrl).toBe(mockWishlistItem.imageUrl);
    expect(item.fieldValues).toEqual(mockWishlistItem.fieldValues);
  });

  it('assigns the provided new id', () => {
    const item = wishlistToItem(mockWishlistItem, 'new-id-2', true)!;
    expect(item.id).toBe('new-id-2');
  });

  it('sets default item state', () => {
    const item = wishlistToItem(mockWishlistItem, 'new-id-2', true)!;
    expect(item.isFavorite).toBe(false);
    expect(item.usageCount).toBe(0);
    expect(item.isDeleted).toBe(false);
    expect(item.inStorage).toBe(false);
  });

  it('does not mutate the original wishlist fieldValues', () => {
    const item = wishlistToItem(mockWishlistItem, 'new-id-2', true)!;
    item.fieldValues['field_name'] = 'Modified';
    expect(mockWishlistItem.fieldValues['field_name']).toBe('Slim Jeans');
  });
});
