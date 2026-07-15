import { findLookupLabel } from '../genericDisplay.js';
import { calculateAge } from '../../utils/format.js';

function residentAge(residentId, residents) {
    const resident = (residents || []).find((r) => String(r.id) === String(residentId));
    return resident ? calculateAge(resident.birthDate) : null;
}

export const youthProfilesConfig = {
    key: 'youthProfiles',
    table: 'youth_profiles',
    title: 'Youth (SK)',
    subtitle: 'Sangguniang Kabataan youth profiling',
    addLabel: '+ Add Youth Profile',
    emptyIcon: '🧑‍🎓',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [{ key: 'residents', source: 'context' }],
    getCandidates: (residents, items) => {
        const registeredIds = new Set(items.map((i) => String(i.residentId)));
        return (residents || []).filter((r) => {
            const age = calculateAge(r.birthDate);
            return age !== null && age >= 15 && age <= 30 && !registeredIds.has(String(r.id));
        });
    },
    // Hides existing youth_profiles rows once the resident has aged past
    // 30 (e.g. registered years ago as a teenager) — the record stays in
    // the database, it's just no longer shown on this tab. Unknown age
    // (missing birth date) is left visible so staff can spot and fix it.
    isEligible: (item, residents) => {
        const age = residentAge(item.residentId, residents);
        return age === null || age <= 30;
    },
    fields: [
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'studentStatus', label: 'Student Status', type: 'select', options: ['In School', 'Out of School Youth', 'Graduate'] },
        { key: 'school', label: 'School', type: 'text' },
        { key: 'organization', label: 'Organization', type: 'text' },
    ],
    searchFields: ['studentStatus', 'school', 'organization'],
    columns: [
        { label: 'Name', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        {
            label: 'Age',
            render: (item, l) => {
                const age = residentAge(item.residentId, l.residents);
                return age != null ? age : '—';
            },
        },
        { label: 'Student Status', render: (item) => item.studentStatus || '—' },
        { label: 'School', render: (item) => item.school || '—' },
        { label: 'Organization', render: (item) => item.organization || '—' },
    ],
    deleteLabel: () => 'this youth profile',
};
