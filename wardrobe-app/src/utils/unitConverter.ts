export class UnitConverter {
    private static readonly CM_TO_INCHES = 0.3937;
    private static readonly INCHES_TO_CM = 2.54;

    static cmToInches(cm: number): number {
        return cm * this.CM_TO_INCHES;
    }

    static inchesToCm(inches: number): number {
        return inches * this.INCHES_TO_CM;
    }
}
