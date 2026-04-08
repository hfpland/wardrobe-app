import type { Item, FieldValue, FieldType, MeasurementValue } from "../types";

export class ItemSerializer {
    serialize(item: Item): Record<string, unknown> {
        return {
            id: item.id,
            categoryId: item.categoryId || null,
            subcategoryId: item.subcategoryId || null,
            imageUrl: item.imageUrl || null,
            fieldValues: this.serializeFieldValues(item.fieldValues),
            isFavorite: item.isFavorite,
            usageCount: item.usageCount,
            fitConfidence: item.fitConfidence,
            materialStretch: item.materialStretch,
            inStorage: item.inStorage,
            isDeleted: item.isDeleted,
            deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
            createdAt: item.createdAt?.toISOString(),
            updatedAt: item.updatedAt?.toISOString(),
            lastWornAt: item.lastWornAt ? item.lastWornAt.toISOString() : null,
        };
    }

    deserialize(doc: Record<string, unknown>): Item {
        return {
            id: doc.id as string,
            categoryId: doc.categoryId as string,
            subcategoryId: doc.subcategoryId ? (doc.subcategoryId as string) : undefined,
            imageUrl: doc.imageUrl ? (doc.imageUrl as string) : undefined,
            fieldValues: this.deserializeFieldValues(doc.fieldValues as Record<string, unknown>),
            isFavorite: doc.isFavorite as boolean,
            usageCount: doc.usageCount as number,
            fitConfidence: doc.fitConfidence as "exact" | 'approximate' | 'flexible',
            materialStretch: doc.materialStretch as boolean,
            inStorage: doc.inStorage as boolean,
            isDeleted: doc.isDeleted as boolean,
            deletedAt: doc.deletedAt ? new Date(doc.deletedAt as string) : undefined,
            createdAt: new Date(doc.createdAt as string),
            updatedAt: new Date(doc.updatedAt as string),
            lastWornAt: doc.lastWornAt ? new Date(doc.lastWornAt as string) : undefined,
        };
    }

    serializeFieldValue(value: FieldValue, fieldType: FieldType): unknown {
        if (value === null || value === undefined) {
            return null;
        }

        switch (fieldType) {
            case 'measurement':
                return value;
            case 'date':
                return typeof value === 'string' ? value : new Date(value as unknown as string).toISOString();
            case 'color':
            case 'multi_select':
                return Array.isArray(value) ? value : [value];
            case 'boolean':
                return Boolean(value);
            case 'number':
                return Number(value);
            default:
                return typeof value === 'string' ? value : String(value);
        }
    }

    deserializeFieldValue(raw: unknown, fieldType: FieldType): FieldValue {
        if (raw === null || raw === undefined) {
            return null
        }
        switch ((fieldType)) {
            case 'measurement':
                return raw as MeasurementValue;
            case 'date':
                return typeof raw === 'string' ? raw : new Date(raw as string).toISOString();
            case 'color':
            case 'multi_select':
                return Array.isArray(raw) ? raw : [raw as string];
            case 'boolean':
                return Boolean(raw);
            case 'number':
                return Number(raw);
            default:
                return String(raw);

        }
    }

    private serializeFieldValues(fieldValues: Record<string, FieldValue>): Record<string, unknown> {
        const serialized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(fieldValues)) {
            if (value === null || value === undefined) {
                serialized[key] = null;
            } else if (typeof value === 'object' && 'type' in value) {
                serialized[key] = value;
            } else if (value instanceof Date) {
                serialized[key] = value.toISOString();
            } else {
                serialized[key] = value;
            }
        }

        return serialized
    }

    private deserializeFieldValues(fieldValues: Record<string, unknown>): Record<string, FieldValue> {
        if (!fieldValues) return {};
        const deserialized: Record<string, FieldValue> = {};

        for (const [key, value] of Object.entries(fieldValues)) {
            if (value === null || value === undefined) {
                deserialized[key] = null;
            } else {
                deserialized[key] = value as FieldValue;
            }
        }
        return deserialized;
    }
}