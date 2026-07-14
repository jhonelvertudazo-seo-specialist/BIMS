import { monthKey } from './format.js';
import { PUROKS } from './constants.js';

function lastSixMonthBuckets() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'short' }),
        });
    }
    return months;
}

export function buildLast6MonthsTrend(residents) {
    const counts = {};
    residents.forEach((r) => {
        const key = monthKey(r.createdAt);
        counts[key] = (counts[key] || 0) + 1;
    });
    return lastSixMonthBuckets().map((m) => ({ label: m.label, value: counts[m.key] || 0 }));
}

export function buildRevenueTrend(certificates) {
    const totals = {};
    certificates.forEach((c) => {
        const key = monthKey(c.issuedAt);
        totals[key] = (totals[key] || 0) + Number(c.fee || 0);
    });
    return lastSixMonthBuckets().map((m) => ({ label: m.label, value: totals[m.key] || 0 }));
}

export function buildZoneDensity(residents) {
    return buildPurokDistribution(residents);
}

export function buildPurokDistribution(list) {
    const counts = {};
    PUROKS.forEach((p) => { counts[p] = 0; });
    list.forEach((item) => { if (item.purok) counts[item.purok] = (counts[item.purok] || 0) + 1; });
    return Object.entries(counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

export function buildHouseholdTrend(households) {
    const counts = {};
    households.forEach((h) => {
        const key = monthKey(h.createdAt);
        counts[key] = (counts[key] || 0) + 1;
    });
    return lastSixMonthBuckets().map((m) => ({ label: m.label, value: counts[m.key] || 0 }));
}
