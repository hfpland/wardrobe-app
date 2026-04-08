import { describe, it, expect } from 'vitest';
import { FieldResolver } from './fieldResolver';
import type { Category } from '../types';

describe('FieldResolver', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat_tops',
      name: 'Tops',
      displayOrder: 1,
      fields: [
        { id: 'field_name', label: 'Name', type: 'text', required: true, displayOrder: 1, fieldType: 'short_text' },
        { id: 'field_colors', label: 'Colors', type: 'color', required: false, displayOrder: 2, fieldType: 'color' },
        { id: 'field_sleeve', label: 'Sleeve Length', type: 'dropdown', required: false, displayOrder: 3, options: ['Short', 'Long'], fieldType: 'dropdown' },
      ],
      subcategories: [
        {
          id: 'sub_tshirts',
          name: 'T-Shirts',
          displayOrder: 1,
          fields: [
            { id: 'field_neckline', label: 'Neckline', type: 'dropdown', required: false, displayOrder: 4, options: ['Crew', 'V-Neck'], fieldType: 'dropdown' },
          ],
        },
      ],
    },
    {
      id: 'cat_bottoms',
      name: 'Bottoms',
      displayOrder: 2,
      fields: [
        { id: 'field_name', label: 'Name', type: 'text', required: true, displayOrder: 1, fieldType: 'short_text' },
        { id: 'field_colors', label: 'Colors', type: 'color', required: false, displayOrder: 2, fieldType: 'color' },
        { id: 'field_waist', label: 'Waist', type: 'measurement', required: false, displayOrder: 3, fieldType: 'measurement' },
      ],
      subcategories: [],
    },
  ];

  it('should resolve fields for category without subcategory', () => {
    const fields = FieldResolver.resolveFields(mockCategories, 'cat_bottoms');

    expect(fields).toHaveLength(3);
    expect(fields[0].id).toBe('field_name');
    expect(fields[1].id).toBe('field_colors');
    expect(fields[2].id).toBe('field_waist');
  });

  it('should resolve fields for category with subcategory', () => {
    const fields = FieldResolver.resolveFields(mockCategories, 'cat_tops', 'sub_tshirts');

    expect(fields).toHaveLength(4);
    expect(fields[0].id).toBe('field_name');
    expect(fields[1].id).toBe('field_colors');
    expect(fields[2].id).toBe('field_sleeve');
    expect(fields[3].id).toBe('field_neckline');
  });

  it('should return empty array for invalid category', () => {
    const fields = FieldResolver.resolveFields(mockCategories, 'invalid_category');

    expect(fields).toHaveLength(0);
  });

  it('should sort fields by displayOrder', () => {
    const fields = FieldResolver.resolveFields(mockCategories, 'cat_tops', 'sub_tshirts');

    for (let i = 1; i < fields.length; i++) {
      expect(fields[i].displayOrder).toBeGreaterThanOrEqual(fields[i - 1].displayOrder);
    }
  });

  it('should identify global fields', () => {
    const globalFields = FieldResolver.getGlobalFields(mockCategories);

    expect(globalFields).toHaveLength(2);
    expect(globalFields.some(f => f.id === 'field_name')).toBe(true);
    expect(globalFields.some(f => f.id === 'field_colors')).toBe(true);
  });

  it('should not duplicate fields', () => {
    const fields = FieldResolver.resolveFields(mockCategories, 'cat_tops', 'sub_tshirts');
    const fieldIds = fields.map(f => f.id);
    const uniqueIds = new Set(fieldIds);

    expect(fieldIds.length).toBe(uniqueIds.size);
  });
});
