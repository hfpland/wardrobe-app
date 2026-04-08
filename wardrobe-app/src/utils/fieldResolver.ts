import type { Category, FieldDefinition } from '../types';

export class FieldResolver {
  /**
   * Resolves the complete list of fields for a given category and optional subcategory.
   * Merges global fields + category fields + subcategory fields in display order.
   * 
   * @param categories - All available categories
   * @param categoryId - The selected category ID
   * @param subcategoryId - Optional subcategory ID
   * @returns Merged and sorted list of field definitions
   */
  static resolveFields(
    categories: Category[],
    categoryId: string,
    subcategoryId?: string
  ): FieldDefinition[] {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      return [];
    }

    const fields: FieldDefinition[] = [];
    const fieldIds = new Set<string>();

    for (const field of category.fields) {
      if (!fieldIds.has(field.id)) {
        fields.push(field);
        fieldIds.add(field.id);
      }
    }

    if (subcategoryId) {
      const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
      if (subcategory?.fields) {
        for (const field of subcategory.fields) {
          if (!fieldIds.has(field.id)) {
            fields.push(field);
            fieldIds.add(field.id);
          }
        }
      }
    }

    return fields.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Gets all global fields (fields that appear in all categories).
   * 
   * @param categories - All available categories
   * @returns List of global field definitions
   */
  static getGlobalFields(categories: Category[]): FieldDefinition[] {
    if (categories.length === 0) {
      return [];
    }

    const firstCategoryFields = categories[0].fields;
    const globalFields: FieldDefinition[] = [];

    for (const field of firstCategoryFields) {
      const isGlobal = categories.every(category =>
        category.fields.some(f => f.id === field.id)
      );

      if (isGlobal) {
        globalFields.push(field);
      }
    }

    return globalFields.sort((a, b) => a.displayOrder - b.displayOrder);
  }
}
