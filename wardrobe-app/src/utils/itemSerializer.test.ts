import { describe, it, expect } from 'vitest';
import { ItemSerializer } from './itemSerializer';
import type { Item } from '../types';

describe('ItemSerializer', () => {
  const serializer = new ItemSerializer();

  it('should serialize and deserialize an item (round-trip)', () => {
    const item: Item = {
      id: 'item-1',
      categoryId: 'cat_tops',
      subcategoryId: 'sub_tshirts',
      imageUrl: 'https://example.com/image.jpg',
      fieldValues: {
        field_name: 'Blue T-Shirt',
        field_colors: ['#0000FF'],
        field_price: 29.99,
      },
      isFavorite: false,
      usageCount: 5,
      fitConfidence: 'exact',
      materialStretch: false,
      inStorage: false,
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const serialized = serializer.serialize(item);
    const deserialized = serializer.deserialize(serialized);

    expect(deserialized.id).toBe(item.id);
    expect(deserialized.categoryId).toBe(item.categoryId);
    expect(deserialized.fieldValues.field_name).toBe('Blue T-Shirt');
    expect(deserialized.createdAt).toBeDefined();
    expect(item.createdAt).toBeDefined();
    expect(deserialized.createdAt!.toISOString()).toBe(item.createdAt!.toISOString());
  });

  it('should handle null and undefined values', () => {
    const item: Item = {
      id: 'item-2',
      categoryId: 'cat_tops',
      fieldValues: {
        field_name: 'Test',
        field_notes: null,
      },
      isFavorite: false,
      usageCount: 0,
      fitConfidence: 'approximate',
      materialStretch: false,
      inStorage: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const serialized = serializer.serialize(item);
    const deserialized = serializer.deserialize(serialized);

    expect(deserialized.subcategoryId).toBeUndefined();
    expect(deserialized.fieldValues.field_notes).toBeNull();
  });

  it('should serialize measurement values correctly', () => {
    const measurementValue = {
      type: 'range' as const,
      min: 90,
      max: 95,
      unit: 'cm' as const,
    };

    const serialized = serializer.serializeFieldValue(measurementValue, 'measurement');
    expect(serialized).toEqual(measurementValue);
  });
});
