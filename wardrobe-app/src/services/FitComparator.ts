import type { Item, PersonProfile, MeasurementValue, MeasurementComparison, FfitComparisonResult } from '../types';
import { UnitConverter } from '../utils/unitConverter';

export class FitComparator {
    /**
     * Compare item measurements against person's body measurements
     * @param item - The clothing item to compare
     * @param personProfile - The person's measurement profile
     * @returns Comparison result with deltas and overall fit assessment
     */
    compareToPersonMeasurements(item: Item, personProfile: PersonProfile): FfitComparisonResult {
        const comparisons: MeasurementComparison[] = [];

        for (const[fieldId, itemValue] of Object.entries(item.fieldValues)) {
            if (
                itemValue  &&
                typeof itemValue === 'object' &&
                'type' in itemValue &&
                'unit' in itemValue 
            ) {
                const measurement = itemValue as MeasurementValue;
            }
        }

        // TODO: 
        // 1. Extract measurement fields from item.fieldValues
        // 2. Match with person measurements by label
        // 3. Normalize units (convert to same unit)
        // 4. Compute deltas using compareMeasurements()
        // 5. Add to comparisons array

        const overallFit = this.determineOverallFit(comparisons);

        return {
            comparisons,
            overallFit,
        };
    }

    /**
     * Compare measurements between two items
     * @param item1 - First item
     * @param item2 - Second item
     * @returns Comparison result with deltas and overall fit assessment
     */
    compareToItem(item1: Item, item2: Item): FfitComparisonResult {
        const comparisons: MeasurementComparison[] = [];

        // TODO:
        // 1. Extract measurement fields from both items
        // 2. Match fields by field definition ID
        // 3. Normalize units
        // 4. Compute deltas using compareMeasurements()
        // 5. Add to comparisons array
for (const [fieldId, value1] of Object.entries(item1.fieldValues)){
    const value2 = item2.fieldValues[fieldId];
    if (
        value1 &&
        value2 &&
        typeof value1 === 'object' &&
        typeof value2 === 'object' &&
        'type' in value1 &&
        'type' in value2 &&
        'unit' in value1 &&
        'unit' in value2
    ) {
        const comparison = this.compareMeasurements(
            value1 as MeasurementValue,
            value2 as MeasurementValue,
            fieldId
        );
        comparisons.push(comparison);
    }
}

        const overallFit = this.determineOverallFit(comparisons);

        return {
            comparisons,
            overallFit,
        };
    }

    /**
     * Find items similar to the given item (same category/subcategory)
     * @param item - The reference item
     * @param allItems - All available items
     * @returns List of similar items
     */
    findSimilarItems(item: Item, allItems: Item[]): Item[] {
        // TODO:
        // 1. Filter by same categoryId
        // 2. Optionally filter by same subcategoryId if item has one
        // 3. Exclude the item itself
        // 4. Return filtered list
        return allItems.filter(i => {
            if (i.id === item.id) {
                return false;
            }
            if (i.categoryId !== item.categoryId) {
                return false
            }
            return true
        });
    }

    /**
     * Compare two measurement values and compute delta
     * Handles single-vs-single, single-vs-range, range-vs-range comparisons
     */
    private compareMeasurements(
        value1: MeasurementValue,
        value2: MeasurementValue,
        fieldLabel: string
    ): MeasurementComparison {
        const normalized1 = this.normalizeMeasurement(value1);
        const normalized2 = this.normalizeMeasurement(value2);

        let deltaMin = 0;
        let deltaMax = 0;
        let withinRange = false;

        // TODO: Implement comparison logic
        // Single vs Single: delta = value1 - value2
        // Single vs Range: check if single is within [min, max]
        // Range vs Range: check overlap, compute min/max deltas

        //single v single
        if (normalized1.type === 'single' && normalized2.type === 'single') {
            const delta = normalized1.value! - normalized2.value!;
            deltaMin = delta;
            deltaMax = delta;
            withinRange = Math.abs(delta) < 2
        }

        //single v range
        else if (normalized1.type === 'single' && normalized2.type === 'range') {
            const value = normalized1.value!;
            withinRange = value >= normalized2.min! && value <= normalized2.max!;
            deltaMin = value - normalized2.max!
            deltaMax = value - normalized2.min!
        }

        //range v single
        else if (normalized1.type === 'range' && normalized2.type === 'single') {
            const value = normalized2.value!;
            withinRange = value >= normalized1.min! && value <= normalized1.max!;
            deltaMin = normalized1.max! - value;
            deltaMax = normalized1.min! - value;
        }

         //range v range
        else if (normalized1.type === 'range' && normalized2.type === 'range') {
            withinRange = !(normalized1.max! < normalized2.min! || normalized1.min! > normalized2.max!);
            deltaMin = normalized1.min! - normalized2.max!;
            deltaMax = normalized1.max! - normalized2.min!;
        }
        
        return {
            fieldLabel,
            itemValue: value1,
            deltaMin,
            deltaMax,
            withinRange,
        };
    }

    /**
     * Normalize measurement to cm for consistent comparison
     */
    private normalizeMeasurement(measurement: MeasurementValue): MeasurementValue {
        if (measurement.unit === 'cm') {
            return measurement;
        }

        // Convert inches to cm
        if (measurement.type === 'single' && measurement.value !== undefined) {
            return {
                type: 'single',
                value: UnitConverter.inchesToCm(measurement.value),
                unit: 'cm',
            };
        }

        if (measurement.type === 'range' && measurement.min !== undefined && measurement.max !== undefined) {
            return {
                type: 'range',
                min: UnitConverter.inchesToCm(measurement.min),
                max: UnitConverter.inchesToCm(measurement.max),
                unit: 'cm',
            };
        }

        return measurement;
    }

    /**
     * Determine overall fit from individual measurement comparisons
     */
    private determineOverallFit(comparisons: MeasurementComparison[]): 'too_small' | 'good_fit' | 'too_large' | 'mixed' {
        if (comparisons.length === 0) {
            return 'good_fit';
        }

        let tooSmallCount = 0;
        let tooLargeCount = 0;
        let goodFitCount = 0;

        for (const comparison of comparisons) {
            if (comparison.withinRange) {
                goodFitCount++;
            }else if (comparison.deltaMax <-2) {
                tooSmallCount++;
            }else if (comparison.deltaMin > 2) {
                tooLargeCount++;
            } else {
                goodFitCount++;
            }
        }

        const total = comparisons.length;

        if (goodFitCount >= total * 0.7) {
            return 'good_fit'
        }
        if(tooSmallCount> tooLargeCount && tooSmallCount >= total * 0.5){
            return 'too_small'
        }

        if(tooLargeCount> tooSmallCount && tooSmallCount >= total * 0.5){
            return 'too_large'
        }
        return 'mixed';
    }
}
