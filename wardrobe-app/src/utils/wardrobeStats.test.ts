import { describe, it, expect } from 'vitest';
import { computeWardrobeStats, countByCategory } from './wardrobeStats';
import type { Item } from '../types';

const base: Omit<Item, 'id' | 'categoryId'> = {
  fieldValues: {},
  isFavorite: false,
  usageCount: 0,
  fitConfidence: 'exact',
  materialStretch: false,
  inStorage: false,
  isDeleted: false,
};

const mockItems: Item[] = [
  { ...base, id: '1', categoryId: 'cat_tops' },
  { ...base, id: '2', categoryId: 'cat_tops' },
  { ...base, id: '3', categoryId: 'cat_bottoms' },
  { ...base, id: '4', categoryId: 'cat_bottoms' },
  { ...base, id: '5', categoryId: 'cat_bottoms' },
  { ...base, id: '6', categoryId: 'cat_footwear', isDeleted: true },
];

describe('computeWardrobeStats', () => {
  it('returns correct total excluding deleted items', () => {
    const stats = computeWardrobeStats(mockItems);
    expect(stats.totalItems).toBe(5);
  });

  it('returns correct per-category breakdown', () => {
    const stats = computeWardrobeStats(mockItems);
    const tops = stats.categoryBreakdown.find(c => c.categoryId === 'cat_tops');
    const bottoms = stats.categoryBreakdown.find(c => c.categoryId === 'cat_bottoms');
    expect(tops?.count).toBe(2);
    expect(bottoms?.count).toBe(3);
  });

  it('excludes deleted items from category breakdown', () => {
    const stats = computeWardrobeStats(mockItems);
    const footwear = stats.categoryBreakdown.find(c => c.categoryId === 'cat_footwear');
    expect(footwear).toBeUndefined();
  });

  it('returns empty stats for empty array', () => {
    const stats = computeWardrobeStats([]);
    expect(stats.totalItems).toBe(0);
    expect(stats.categoryBreakdown).toHaveLength(0);
  });

  it('breakdown counts sum to totalItems', () => {
    const stats = computeWardrobeStats(mockItems);
    const sum = stats.categoryBreakdown.reduce((acc, c) => acc + c.count, 0);
    expect(sum).toBe(stats.totalItems);
  });
});

describe('countByCategory', () => {
  it('returns correct count for a category', () => {
    expect(countByCategory(mockItems, 'cat_tops')).toBe(2);
    expect(countByCategory(mockItems, 'cat_bottoms')).toBe(3);
  });

  it('excludes deleted items', () => {
    expect(countByCategory(mockItems, 'cat_footwear')).toBe(0);
  });

  it('returns 0 for unknown category', () => {
    expect(countByCategory(mockItems, 'cat_unknown')).toBe(0);
  });
});
