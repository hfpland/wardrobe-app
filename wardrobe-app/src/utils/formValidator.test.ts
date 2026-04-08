import { describe, it, expect } from 'vitest';
import { FormValidator } from './formValidator';
import type { FieldDefinition, FieldValue } from '../types';

describe('FormValidator', () => {
  it('should pass validation for valid form data', () => {
    const fields: FieldDefinition[] = [
      { id: 'field_name', label: 'Name', type: 'text', required: true, displayOrder: 1 },
      { id: 'field_price', label: 'Price', type: 'number', required: false, displayOrder: 2 },
    ];

    const values: Record<string, FieldValue> = {
      field_name: 'Blue Shirt',
      field_price: 29.99,
    };

    const errors = FormValidator.validateForm(values, fields);
    expect(errors).toHaveLength(0);
  });

  it('should return error for missing required field', () => {
    const fields: FieldDefinition[] = [
      { id: 'field_name', label: 'Name', type: 'text', required: true, displayOrder: 1 },
    ];

    const values: Record<string, FieldValue> = {};

    const errors = FormValidator.validateForm(values, fields);
    expect(errors).toHaveLength(1);
    expect(errors[0].fieldId).toBe('field_name');
    expect(errors[0].message).toContain('required');
  });

  it('should validate measurement values', () => {
    const fields: FieldDefinition[] = [
      { id: 'field_chest', label: 'Chest', type: 'measurement', required: true, displayOrder: 1 },
    ];

    const values: Record<string, FieldValue> = {
      field_chest: {
        type: 'range',
        min: 95,
        max: 90, // Invalid: min > max
        unit: 'cm',
      },
    };

    const errors = FormValidator.validateForm(values, fields);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('minimum cannot be greater than maximum');
  });

  it('should validate positive measurement values', () => {
    const fields: FieldDefinition[] = [
      { id: 'field_length', label: 'Length', type: 'measurement', required: true, displayOrder: 1 },
    ];

    const values: Record<string, FieldValue> = {
      field_length: {
        type: 'single',
        value: -10, // Invalid: negative value
        unit: 'cm',
      },
    };

    const errors = FormValidator.validateForm(values, fields);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('positive number');
  });

  it('should validate field value types', () => {
    const fields: FieldDefinition[] = [
      { id: 'field_price', label: 'Price', type: 'number', required: true, displayOrder: 1 },
    ];

    const values: Record<string, FieldValue> = {
      field_price: 'not a number', // Invalid type
    };

    const errors = FormValidator.validateForm(values, fields);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('must be a number');
  });
});
