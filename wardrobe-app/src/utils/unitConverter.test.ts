import { describe, it, expect } from 'vitest';
import { UnitConverter } from './unitConverter';

describe('UnitConverter', () => {
  it('should convert cm to inches', () => {
    expect(UnitConverter.cmToInches(100)).toBeCloseTo(39.37, 2);
    expect(UnitConverter.cmToInches(2.54)).toBeCloseTo(1, 2);
  });

  it('should convert inches to cm', () => {
    expect(UnitConverter.inchesToCm(1)).toBeCloseTo(2.54, 2);
    expect(UnitConverter.inchesToCm(39.37)).toBeCloseTo(100, 2);
  });

  it('should handle round-trip conversion', () => {
    const originalCm = 95;
    const inches = UnitConverter.cmToInches(originalCm);
    const backToCm = UnitConverter.inchesToCm(inches);
    expect(backToCm).toBeCloseTo(originalCm, 2);
  });
});
