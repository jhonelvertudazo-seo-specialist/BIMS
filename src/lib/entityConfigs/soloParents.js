import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';

export const soloParentsConfig = {
    key: 'soloParents',
    table: 'solo_parents',
    title: 'Solo Parent',
    subtitle: 'Solo Parent ID registry',
    addLabel: '+ Register Solo Parent',
    emptyIcon: '🧑‍🍼',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'soloParentId',
    codePrefix: 'SP-',
    codePattern: /SP-(\d+)/,
    codePadLength: 4,
    lookups: [{ key: 'residents', source: 'context' }],
    fields: [
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'soloParentId', label: 'Solo Parent ID', type: 'text', auto: true },
        {
            key: 'reason', label: 'Reason', type: 'select',
            options: ['Death of Spouse', 'Separation/Annulment', 'Abandonment', 'Solo by Choice', 'Detention/Imprisonment of Spouse', 'OFW Spouse', 'Other'],
        },
        { key: 'numDependents', label: 'Number of Dependents', type: 'number' },
        { key: 'dateIssued', label: 'Date Issued', type: 'date' },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
    ],
    searchFields: ['soloParentId', 'reason'],
    columns: [
        { label: 'Solo Parent ID', render: (item) => item.soloParentId || '—' },
        { label: 'Name', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        { label: 'Reason', render: (item) => item.reason || '—' },
        { label: 'Dependents', render: (item) => item.numDependents || 0 },
        { label: 'Expiration', render: (item) => (item.expirationDate ? formatDate(item.expirationDate) : '—') },
    ],
    deleteLabel: (item) => item.soloParentId || 'this record',
};
