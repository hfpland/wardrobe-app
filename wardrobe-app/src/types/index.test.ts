import {describe, it, expect } from 'vitest';
import type {Item } from './index';

describe('type definitions', ()=> {
    it('should create a valid Item', ()=> {
        const item: Item = {
            id : 'test-1',
            categoryId: 'cat-1',
            fieldValues: {},
            isFavorite: false,
            usageCount: 0,
            fitConfidence:'exact',
            materialStretch: false,
            inStorage: false,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),

        };
        expect(item.id).toBe('test-1');
    });
});