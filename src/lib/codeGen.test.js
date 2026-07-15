import { describe, it, expect } from 'vitest';
import { nextSequentialCode } from './codeGen.js';

describe('nextSequentialCode', () => {
    const pattern = /RES-(\d+)/;

    it('starts at 1 when the list is empty', () => {
        expect(nextSequentialCode([], 'residentId', pattern, 'RES-', 4)).toBe('RES-0001');
    });

    it('continues from the highest existing number regardless of list order', () => {
        const list = [{ residentId: 'RES-0003' }, { residentId: 'RES-0001' }, { residentId: 'RES-0002' }];
        expect(nextSequentialCode(list, 'residentId', pattern, 'RES-', 4)).toBe('RES-0004');
    });

    it('ignores entries that do not match the pattern', () => {
        const list = [{ residentId: 'RES-0005' }, { residentId: 'not-a-match' }, { residentId: null }];
        expect(nextSequentialCode(list, 'residentId', pattern, 'RES-', 4)).toBe('RES-0006');
    });
});
