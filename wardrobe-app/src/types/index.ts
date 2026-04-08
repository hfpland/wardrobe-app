import '@testing-library/jest-dom'

export type FieldType =
    | "short_text"
    | "long_text"
    | "number"
    | "color"
    | "dropdown"
    | "multi_select"
    | "boolean"
    | "date"
    | "measurement";

    export interface FieldDefinition {
        type: string;
        id: string;
        label: string;
        fieldType: FieldType;
        required: boolean;
        defaultValue?: FieldValue;
        options?: string[];
        displayOrder: number;
        unit?: string;
    }

    export interface Category {
        id: string;
        name:string;
        displayOrder: number;
        fields: FieldDefinition[];
        subcategories: Subcategory[];
    }

    export interface Subcategory {
        id:string;
        name: string;
        displayOrder: number;
        fields: FieldDefinition[];
    }

    export interface MeasurementValue {
        type : "single" | "range";
        value? : number;
        min?: number;
        max?: number;
        unit: "cm" | "inches";
    }

    export type FieldValue = 
    | string
    | number
    | boolean
    | string[]
    | MeasurementValue
    | null;

    export interface Item {
        id: string;
        categoryId: string;
        subcategoryId?: string;
        imageUrl?: string;
        fieldValues: Record<string, FieldValue>;
        isFavorite: boolean;
        usageCount: number;
        fitConfidence: "exact" | "approximate" | "flexible";
        materialStretch: boolean;
        inStorage: boolean;
        isDeleted: boolean;
        deletedAt?: Date;
        createdAt?: Date;
        updatedAt?: Date;
        lastWornAt?: Date;
    }

    export interface WishlistItem {
        id: string;
        categoryId: string;
        subcategoryId?: string;
        imageUrl?:string;
        fieldValues: Record<string, FieldValue>;
        createdAt: Date;
    }

    export interface PresetItem {
        id: string;
        name: string;
        categoryId: string;
        subcategoryId?: string;
        imageUrl?: string;
        fieldValues: Record<string, FieldValue>;
    }

    export interface PersonMeasurement {
        id: string;
        label: string;
        value: MeasurementValue;
    }

    export interface PersonProfile{
        measrements: PersonMeasurement;
        updateAt: Date;
    }

    export interface MeasurementComparison {
        fieldLabel: string;
        itemValue: MeasurementValue;
        deltaMin: number;
        deltaMax: number;
        withinRange: boolean;
    }

    export interface FfitComparisonResult {
        comparisons: MeasurementComparison[];
        overallFit: "too_small" | "good_fit" | "too_large" | "mixed";
    }

    export type ItemActionType = 
    | "created"
    | "edited"
    | "worn"
    | "favorited"
    | "unfavorited"
    | "moved"
    | "storage_in"
    | "storage_out";

    export interface ItemAction {
        type: ItemActionType;
        timestamp: Date;
        details?: Record<string, unknown>;
    }

    export interface ItemHistoryEvent {
        id: string;
        itemId: string;
        action: ItemAction;
    }

    export interface PackingListItem {
        itemId: string;
        isPacked: boolean;
    }

    export interface PackingList {
        id: string;
        name: string;
        createAt: Date;
        updatedAt: Date;
    }

    export interface WardrobeBackup {
        version: string;
        exportedAt: Date;
        items: Item[];
        categories: Category[];
        personProfile: PersonProfile;
        wishlistItems: WishlistItem[];
        presetItems: PresetItem[];
        settings: Record<string, unknown>;
    }