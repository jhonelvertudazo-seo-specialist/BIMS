import { calculateAge } from './format.js';

// Derives a household's member counts from actual linked residents
// (residents.householdId) instead of the manually-typed numbers the form
// used to ask for. Kept in sync automatically by src/context/DataContext.jsx
// whenever a resident is added, moved between households, edited, or removed.
export function computeHouseholdCounts(householdId, residents) {
    const members = (residents || []).filter((r) => r.householdId === householdId);
    return {
        familyMembersCount: members.length,
        voterMembersCount: members.filter((r) => r.registeredVoter).length,
        pwdMembersCount: members.filter((r) => r.sector === 'PWD').length,
        seniorMembersCount: members.filter((r) => r.sector === 'Senior Citizen' || (calculateAge(r.birthDate) ?? 0) >= 60).length,
    };
}
