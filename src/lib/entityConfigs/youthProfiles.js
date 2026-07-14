import { findLookupLabel } from '../genericDisplay.js';
import { calculateAge } from '../../utils/format.js';

export const youthProfilesConfig = {
    key: 'youthProfiles',
    table: 'youth_profiles',
    title: 'Youth (SK)',
    subtitle: 'Sangguniang Kabataan youth profiling',
    addLabel: '+ Add Youth Profile',
    emptyIcon: '🧑‍🎓',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [{ key: 'residents', source: 'context' }],
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
                const resident = (l.residents || []).find((r) => String(r.id) === String(item.residentId));
                const age = resident ? calculateAge(resident.birthDate) : null;
                return age != null ? age : '—';
            },
        },
        { label: 'Student Status', render: (item) => item.studentStatus || '—' },
        { label: 'School', render: (item) => item.school || '—' },
        { label: 'Organization', render: (item) => item.organization || '—' },
    ],
    deleteLabel: () => 'this youth profile',
};
