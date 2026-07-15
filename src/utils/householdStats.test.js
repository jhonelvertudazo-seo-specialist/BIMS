import { describe, it, expect } from 'vitest';
import { computeHouseholdCounts } from './householdStats.js';

function daysAgoYears(years) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d.toISOString().slice(0, 10);
}

describe('computeHouseholdCounts', () => {
    it('counts only residents linked to the given household', () => {
        const residents = [
            { id: '1', householdId: 'hh-1', registeredVoter: false, sector: 'Regular Resident', birthDate: daysAgoYears(30) },
            { id: '2', householdId: 'hh-2', registeredVoter: true, sector: 'Regular Resident', birthDate: daysAgoYears(30) },
        ];
        expect(computeHouseholdCounts('hh-1', residents).familyMembersCount).toBe(1);
    });

    it('counts registered voters, PWD, and 60+/tagged seniors independently', () => {
        const residents = [
            { id: '1', householdId: 'hh-1', registeredVoter: true, sector: 'Regular Resident', birthDate: daysAgoYears(40) },
            { id: '2', householdId: 'hh-1', registeredVoter: false, sector: 'PWD', birthDate: daysAgoYears(20) },
            { id: '3', householdId: 'hh-1', registeredVoter: false, sector: 'Regular Resident', birthDate: daysAgoYears(65) },
        ];
        const counts = computeHouseholdCounts('hh-1', residents);
        expect(counts).toEqual({
            familyMembersCount: 3,
            voterMembersCount: 1,
            pwdMembersCount: 1,
            seniorMembersCount: 1,
        });
    });

    it('returns all zeros for a household with no linked residents', () => {
        expect(computeHouseholdCounts('hh-empty', [])).toEqual({
            familyMembersCount: 0,
            voterMembersCount: 0,
            pwdMembersCount: 0,
            seniorMembersCount: 0,
        });
    });
});
