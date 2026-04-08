import { describe, it, expect } from 'vitest';
import { FitComparator } from './FitComparator';
import type { Item, PersonProfile } from '../types';

describe('FitComparator', () => {
  const comparator = new FitComparator();

  describe('findSimilarItems', () => {
    it('should find items with same category', () => {
      const item: Item = {
        id: 'item-1',
        categoryId: 'cat_tops',
        subcategoryId: 'sub_tshirts',
        fieldValues: {},
        isFavorite: false,
        usageCount: 0,
        fitConfidence: 'exact',
        materialStretch: false,
        inStorage: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const allItems: Item[] = [
        item,
        { ...item, id: 'item-2', categoryId: 'cat_tops' },
        { ...item, id: 'item-3', categoryId: 'cat_bottoms' },
        { ...item, id: 'item-4', categoryId: 'cat_tops', subcategoryId: 'sub_shirts' },
      ];

      const similar = comparator.findSimilarItems(item, allItems);

      // Should find items 2 and 4 (same category, excluding itself)
      expect(similar).toHaveLength(2);
      expect(similar.some(i => i.id === 'item-2')).toBe(true);
      expect(similar.some(i => i.id === 'item-4')).toBe(true);
    });

    it('should exclude the item itself', () => {
      const item: Item = {
        id: 'item-1',
        categoryId: 'cat_tops',
        fieldValues: {},
        isFavorite: false,
        usageCount: 0,
        fitConfidence: 'exact',
        materialStretch: false,
        inStorage: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const similar = comparator.findSimilarItems(item, [item]);

      expect(similar).toHaveLength(0);
    });
  });

  describe('compareToPersonMeasurements', () => {
    it('should compare item measurements to person profile', () => {
      // TODO: Add test implementation
      // Create item with measurement fields
      // Create person profile with measurements
      // Call compareToPersonMeasurements
      // Verify comparisons array and overallFit
    });
  });

  describe('compareToItem', () => {
    it('should compare measurements between two items', () => {
      // TODO: Add test implementation
      // Create two items with measurement fields
      // Call compareToItem
      // Verify comparisons array and overallFit
    });
  });
});
