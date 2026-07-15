import { findLookupLabel } from '../genericDisplay.js';
import { formatDate, calculateAge } from '../../utils/format.js';

export const seniorCitizensConfig = {
    key: 'seniorCitizens',
    table: 'senior_citizens',
    title: 'Senior Citizen',
    subtitle: 'OSCA-registered senior citizens masterlist',
    addLabel: '+ Register Senior Citizen',
    emptyIcon: '👴',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'oscaNumber',
    codePrefix: 'OSCA-',
    codePattern: /OSCA-(\d+)/,
    codePadLength: 4,
    lookups: [{ key: 'residents', source: 'context' }],
    // Residents who look old enough for this registry but don't have a
    // senior_citizens row yet — surfaced on the page itself (not just the
    // Dashboard alert) so "no data" here isn't mistaken for a bug when
    // it's really just "nobody has been registered yet".
    getCandidates: (residents, items) => {
        const registeredIds = new Set(items.map((i) => String(i.residentId)));
        return (residents || []).filter((r) => {
            if (registeredIds.has(String(r.id))) return false;
            const age = calculateAge(r.birthDate);
            return r.sector === 'Senior Citizen' || (age !== null && age >= 60);
        });
    },
    fields: [
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'oscaNumber', label: 'OSCA Number', type: 'text', auto: true },
        { key: 'pensionStatus', label: 'Pension Status', type: 'select', options: ['Receiving', 'Not Receiving', 'Pending Application'] },
        { key: 'pensionType', label: 'Pension Type', type: 'select', options: ['DSWD Social Pension', 'SSS', 'GSIS', 'Private', 'None'] },
        { key: 'dateRegistered', label: 'Date Registered', type: 'date' },
        { key: 'medicalConditions', label: 'Medical Conditions', type: 'textarea', col: 'col-12' },
        { key: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
    ],
    searchFields: ['oscaNumber', 'pensionStatus'],
    columns: [
        { label: 'OSCA No.', render: (item) => item.oscaNumber || '—' },
        { label: 'Name', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        {
            label: 'Age',
            render: (item, l) => {
                const resident = (l.residents || []).find((r) => String(r.id) === String(item.residentId));
                const age = resident ? calculateAge(resident.birthDate) : null;
                return age != null ? age : '—';
            },
        },
        { label: 'Pension Status', render: (item) => item.pensionStatus || '—' },
        { label: 'Date Registered', render: (item) => (item.dateRegistered ? formatDate(item.dateRegistered) : '—') },
    ],
    deleteLabel: (item) => item.oscaNumber || 'this record',
};
