import { describe, it, expect } from 'vitest';
import { expiryStatus, isExpiringOrExpired } from './expiryStatus.js';

function daysFromNow(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

describe('expiryStatus', () => {
    it('reports "No Expiry" when there is no date', () => {
        expect(expiryStatus(null).label).toBe('No Expiry');
    });

    it('reports "Expired" for a past date', () => {
        expect(expiryStatus(daysFromNow(-1)).label).toBe('Expired');
    });

    it('reports "Active" when well beyond the warning window', () => {
        expect(expiryStatus(daysFromNow(90)).label).toBe('Active');
    });
});

describe('isExpiringOrExpired', () => {
    it('is false when there is no date', () => {
        expect(isExpiringOrExpired(null)).toBe(false);
    });

    it('is true for an already-expired date', () => {
        expect(isExpiringOrExpired(daysFromNow(-5))).toBe(true);
    });

    it('is false for a date safely beyond the warning window', () => {
        expect(isExpiringOrExpired(daysFromNow(120))).toBe(false);
    });
});
