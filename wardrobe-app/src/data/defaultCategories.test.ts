import { describe, it, expect } from 'vitest';
import { defaultCategories } from './defaultCategories';

describe('Default Categories', () => {
  it('should have 7 categories', () => {
    expect(defaultCategories).toHaveLength(7);
  });

  it('should have all required categories', () => {
    const categoryNames = defaultCategories.map(c => c.name);
    expect(categoryNames).toContain('Tops');
    expect(categoryNames).toContain('Bottoms');
    expect(categoryNames).toContain('Dresses');
    expect(categoryNames).toContain('Footwear');
    expect(categoryNames).toContain('Accessories');
    expect(categoryNames).toContain('Underwear');
    expect(categoryNames).toContain('Sportswear');
  });

  it('should have global fields in all categories', () => {
    defaultCategories.forEach(category => {
      const fieldLabels = category.fields.map(f => f.label);
      expect(fieldLabels).toContain('Name');
      expect(fieldLabels).toContain('Ownership Status');
      expect(fieldLabels).toContain('Colors');
    });
  });

  it('Tops category should have subcategories', () => {
    const tops = defaultCategories.find(c => c.id === 'cat_tops');
    expect(tops?.subcategories).toHaveLength(9);
  });
});
