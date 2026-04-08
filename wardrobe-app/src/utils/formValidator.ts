import type { FieldDefinition, FieldValue, MeasurementValue } from '../types';

export interface ValidationError {
  fieldId: string;
  message: string;
}

export class FormValidator {
  static validateForm(
    fieldValues: Record<string, FieldValue>,
    fieldDefinitions: FieldDefinition[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of fieldDefinitions) {
      const value = fieldValues[field.id];

      // Check required fields
      if (field.required) {
        if (value === null || value === undefined || value === '') {
          errors.push({
            fieldId: field.id,
            message: `${field.label} is required`,
          });
          continue;
        }

        // Check for empty arrays in multi-select and color fields
        if (Array.isArray(value) && value.length === 0) {
          errors.push({
            fieldId: field.id,
            message: `${field.label} is required`,
          });
          continue;
        }
      }

      // Skip validation if field is empty and not required
      if (value === null || value === undefined || value === '') {
        continue;
      }

      // Validate field value types
      const typeError = this.validateFieldType(value, field);
      if (typeError) {
        errors.push({
          fieldId: field.id,
          message: typeError,
        });
      }

      // Validate measurement values
      if (field.type === 'measurement' && value !== null) {
        const measurementError = this.validateMeasurement(value as MeasurementValue, field.label);
        if (measurementError) {
          errors.push({
            fieldId: field.id,
            message: measurementError,
          });
        }
      }
    }

    return errors;
  }

  private static validateFieldType(value: FieldValue, field: FieldDefinition): string | null {
    if (value === null) return null;

    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return `${field.label} must be text`;
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          return `${field.label} must be a number`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${field.label} must be true or false`;
        }
        break;

      case 'date':
        if (typeof value !== 'string') {
          return `${field.label} must be a valid date`;
        }
        break;

      case 'color':
      case 'multi_select':
        if (!Array.isArray(value)) {
          return `${field.label} must be a list`;
        }
        break;

      case 'dropdown':
        if (typeof value !== 'string') {
          return `${field.label} must be a valid option`;
        }
        break;

      case 'measurement':
        if (typeof value !== 'object' || !('type' in value)) {
          return `${field.label} must be a valid measurement`;
        }
        break;
    }

    return null;
  }

  private static validateMeasurement(measurement: MeasurementValue, fieldLabel: string): string | null {
    // Validate measurement type
    if (measurement.type !== 'single' && measurement.type !== 'range') {
      return `${fieldLabel} has invalid measurement type`;
    }

    // Validate unit
    if (measurement.unit !== 'cm' && measurement.unit !== 'inches') {
      return `${fieldLabel} has invalid unit`;
    }

    // Validate single value
    if (measurement.type === 'single') {
      if (typeof measurement.value !== 'number' || measurement.value <= 0) {
        return `${fieldLabel} must be a positive number`;
      }
    }

    // Validate range values
    if (measurement.type === 'range') {
      if (typeof measurement.min !== 'number' || measurement.min <= 0) {
        return `${fieldLabel} minimum must be a positive number`;
      }
      if (typeof measurement.max !== 'number' || measurement.max <= 0) {
        return `${fieldLabel} maximum must be a positive number`;
      }
      if (measurement.min > measurement.max) {
        return `${fieldLabel} minimum cannot be greater than maximum`;
      }
    }

    return null;
  }
}
