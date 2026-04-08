import { describe, it, expect } from 'vitest';
import { filterByCategory, filterByFavorite, searchItems, sortItems } from './itemFilters';
import type { Item } from '../types';

describe('itemFilters', () => {
  const mockItems: Item[] = [
    {
      id: 'item-1',
      categoryId: 'cat_tops',
      subcategoryId: 'sub_tshirts',
      fieldValues: {
        field_name: 'Blue T-Shirt',
        field_brand: 'Nike',
        field_colors: ['#0000FF'],
      },
      isFavorite: true,
      usageCount: 10,
      fitConfidence: 'exact',
      materialStretch: false,
      inStorage: false,
      isDeleted: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'item-2',
      categoryId: 'cat_tops',
      subcategoryId: 'sub_shirts',
      fieldValues: {
        field_name: 'Red Shirt',
        field_brand: 'Adidas',
      },
      isFavorite: false,
      usageCount: 5,
      fitConfidence: 'approximate',
      materialStretch: false,
      inStorage: false,
      isDeleted: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: 'item-3',
      categoryId: 'cat_bottoms',
      fieldValues: {
        field_name: 'Blue Jeans',
        field_brand: 'Levi\'s',
      },
      isFavorite: true,
      usageCount: 15,
      fitConfidence: 'exact',
      materialStretch: true,
      inStorage: false,
      isDeleted: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ];

  describe('filterByCategory', () => {
    it('should filter items by category', () => {
      const result = filterByCategory(mockItems, 'cat_tops');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.categoryId === 'cat_tops')).toBe(true);
    });

    it('should filter items by category and subcategory', () => {
      const result = filterByCategory(mockItems, 'cat_tops', 'sub_tshirts');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });
  });

  describe('filterByFavorite', () => {
    it('should return only favorite items when favoritesOnly is true', () => {
      const result = filterByFavorite(mockItems, true);
      expect(result).toHaveLength(2);
      expect(result.every(item => item.isFavorite)).toBe(true);
    });

    it('should return all items when favoritesOnly is false', () => {
      const result = filterByFavorite(mockItems, false);
      expect(result).toHaveLength(3);
    });
  });

  describe('searchItems', () => {
    it('should search items by name', () => {
      const result = searchItems(mockItems, 'blue');
      expect(result).toHaveLength(2);
      expect(result.some(item => item.id === 'item-1')).toBe(true);
      expect(result.some(item => item.id === 'item-3')).toBe(true);
    });

    it('should search items by brand', () => {
      const result = searchItems(mockItems, 'nike');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });

    it('should be case-insensitive', () => {
      const result = searchItems(mockItems, 'BLUE');
      expect(result).toHaveLength(2);
    });

    it('should respect category filter', () => {
      const result = searchItems(mockItems, 'blue', 'cat_tops');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });
  });

  describe('sortItems', () => {
    it('should sort by newest first', () => {
      const result = sortItems(mockItems, 'newest');
      expect(result[0].id).toBe('item-3'); // 2024-01-20
      expect(result[2].id).toBe('item-2'); // 2024-01-10
    });

    it('should sort by oldest first', () => {
      const result = sortItems(mockItems, 'oldest');
      expect(result[0].id).toBe('item-2'); // 2024-01-10
      expect(result[2].id).toBe('item-3'); // 2024-01-20
    });

    it('should sort by most used first', () => {
      const result = sortItems(mockItems, 'most_used');
      expect(result[0].id).toBe('item-3'); // usageCount: 15
      expect(result[2].id).toBe('item-2'); // usageCount: 5
    });

    it('should sort by least used first', () => {
      const result = sortItems(mockItems, 'least_used');
      expect(result[0].id).toBe('item-2'); // usageCount: 5
      expect(result[2].id).toBe('item-3'); // usageCount: 15
    });
  });
});
