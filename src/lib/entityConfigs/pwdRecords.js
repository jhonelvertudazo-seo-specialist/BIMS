import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';

export const pwdRecordsConfig = {
    key: 'pwdRecords',
    table: 'pwd_records',
    title: 'PWD Record',
    subtitle: 'Persons with Disabilities (PWD) masterlist',
    addLabel: '+ Register PWD',
    emptyIcon: '♿',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'pwdIdNumber',
    codePrefix: 'PWD-',
    codePattern: /PWD-(\d+)/,
    codePadLength: 4,
    lookups: [{ key: 'residents', source: 'context' }],
    // Residents tagged with the PWD sector but not yet in this registry —
    // shown directly in the table below (not just a separate alert) so
    // they're not missed.
    getCandidates: (residents, items) => {
        const registeredIds = new Set(items.map((i) => String(i.residentId)));
        return (residents || []).filter((r) => r.sector === 'PWD' && !registeredIds.has(String(r.id)));
    },
    fields: [
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'pwdIdNumber', label: 'PWD ID Number', type: 'text', auto: true },
        {
            key: 'disabilityType', label: 'Disability Type', type: 'select',
            options: ['Visual', 'Hearing', 'Speech', 'Physical/Orthopedic', 'Intellectual', 'Psychosocial', 'Learning', 'Multiple'],
        },
        { key: 'disabilityCause', label: 'Disability Cause', type: 'select', options: ['Congenital', 'Illness', 'Injury/Accident', 'Unknown'] },
        { key: 'dateIssued', label: 'Date Issued', type: 'date' },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
        { key: 'assistanceReceived', label: 'Assistance Received', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['pwdIdNumber', 'disabilityType'],
    columns: [
        { label: 'PWD ID No.', render: (item) => item.pwdIdNumber || '—' },
        { label: 'Name', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        { label: 'Disability Type', render: (item) => item.disabilityType || '—' },
        { label: 'Date Issued', render: (item) => (item.dateIssued ? formatDate(item.dateIssued) : '—') },
        { label: 'Expiration', render: (item) => (item.expirationDate ? formatDate(item.expirationDate) : '—') },
    ],
    deleteLabel: (item) => item.pwdIdNumber || 'this record',
};
