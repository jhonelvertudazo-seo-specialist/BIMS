import { describe, it, expect } from 'vitest';
import { toSnake, toCamel, fromRow, toRow } from './genericMapper.js';

describe('toSnake / toCamel', () => {
    it('converts camelCase to snake_case and back', () => {
        expect(toSnake('residentId')).toBe('resident_id');
        expect(toCamel('resident_id')).toBe('residentId');
    });
});

describe('fromRow / toRow', () => {
    const config = {
        fields: [
            { key: 'residentId', column: 'resident_id' },
            { key: 'pwdIdNumber' },
            { key: 'fee', type: 'currency' },
            { key: 'active', type: 'checkbox' },
        ],
    };

    it('maps a DB row to camelCase, coercing types per field', () => {
        const row = { id: '1', resident_id: 'abc', pwd_id_number: 'PWD-0001', fee: '150.50', active: 1, created_at: '2024-01-01T00:00:00Z' };
        const record = fromRow(config, row);
        expect(record).toMatchObject({ id: '1', residentId: 'abc', pwdIdNumber: 'PWD-0001', fee: 150.5, active: true });
    });

    it('round-trips a record back to a DB row', () => {
        const record = { residentId: 'abc', pwdIdNumber: '  PWD-0001  ', fee: 150.5, active: true };
        const row = toRow(config, record);
        expect(row).toEqual({ resident_id: 'abc', pwd_id_number: 'PWD-0001', fee: 150.5, active: true });
    });

    it('normalizes blank strings to null when writing back', () => {
        const record = { residentId: '   ', pwdIdNumber: 'X', fee: '', active: false };
        const row = toRow(config, record);
        expect(row.resident_id).toBeNull();
        expect(row.fee).toBeNull();
    });
});
