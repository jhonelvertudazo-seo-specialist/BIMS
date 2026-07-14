import { createElement } from 'react';
import { findLookupLabel } from '../genericDisplay.js';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { expiryStatus, isExpiringOrExpired } from '../expiryStatus.js';

const baseFields = [
    { key: 'businessId', label: 'Business', type: 'lookup', lookup: 'businesses', displayField: 'business_name', column: 'business_id', required: true, col: 'col-12' },
    { key: 'orNumber', label: 'OR Number', type: 'text', auto: true },
    { key: 'permitType', label: 'Permit Type', type: 'select', options: ['Business Clearance', 'New Permit', 'Permit Renewal', 'Special Permit'], required: true },
    { key: 'fee', label: 'Fee', type: 'currency' },
    { key: 'issuedDate', label: 'Issued Date', type: 'date' },
    { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Renewed'] },
];

const baseColumns = [
    { label: 'OR Number', render: (item) => item.orNumber || '—' },
    { label: 'Business', render: (item, l) => findLookupLabel(l, 'businesses', item.businessId, 'business_name') || '—' },
    { label: 'Permit Type', render: (item) => item.permitType || '—' },
    { label: 'Fee', render: (item) => formatCurrency(item.fee) },
    { label: 'Issued', render: (item) => (item.issuedDate ? formatDate(item.issuedDate) : '—') },
    {
        label: 'Expiration',
        render: (item) => {
            const s = expiryStatus(item.expirationDate);
            return createElement('span', { className: `status-pill ${s.cls}` }, s.label);
        },
    },
];

const shared = {
    table: 'business_permits',
    emptyIcon: '📋',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'orNumber',
    codePrefix: 'BPR-',
    codePattern: /BPR-(\d+)/,
    codePadLength: 6,
    lookups: [{ key: 'businesses', source: 'table', table: 'businesses' }],
    fields: baseFields,
    searchFields: ['orNumber', 'permitType'],
    columns: baseColumns,
    deleteLabel: (item) => item.orNumber || 'this permit record',
};

export const businessClearanceConfig = {
    ...shared,
    key: 'businessClearance',
    title: 'Business Clearance',
    subtitle: 'Issue and track business clearances and permits',
    addLabel: '+ Issue Permit',
    stats: [
        { label: 'Permits Issued', icon: '📋', compute: (items) => items.length },
        { label: 'Active', icon: '✅', compute: (items) => items.filter((i) => i.status === 'Active').length },
    ],
};

export const permitRenewalConfig = {
    ...shared,
    key: 'permitRenewal',
    title: 'Permit Renewal',
    subtitle: 'Permits expiring within 60 days or already expired',
    addLabel: '+ Renew Permit',
    filterItems: (items) => items.filter((i) => isExpiringOrExpired(i.expirationDate)),
    stats: [
        { label: 'Needing Renewal', icon: '⚠️', compute: (items) => items.length },
    ],
};
