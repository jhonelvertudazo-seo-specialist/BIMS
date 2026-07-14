import { createElement } from 'react';
import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';
import { expiryStatus } from '../expiryStatus.js';

export const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'Corporation', 'Cooperative'];

export const businessesConfig = {
    key: 'businesses',
    table: 'businesses',
    title: 'Business',
    subtitle: 'Registered businesses operating within the barangay',
    addLabel: '+ Register Business',
    emptyIcon: '🏪',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'businessCode',
    codePrefix: 'BUS-',
    codePattern: /BUS-(\d+)/,
    codePadLength: 4,
    lookups: [{ key: 'residents', source: 'context' }],
    fields: [
        { key: 'businessCode', label: 'Business ID', type: 'text', auto: true },
        { key: 'businessName', label: 'Business Name', type: 'text', required: true, col: 'col-12 col-md-6' },
        { key: 'ownerResidentId', label: 'Owner', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'owner_resident_id', required: true, col: 'col-12 col-md-6' },
        { key: 'businessType', label: 'Business Type', type: 'select', options: BUSINESS_TYPES },
        { key: 'natureOfBusiness', label: 'Nature of Business', type: 'text' },
        { key: 'address', label: 'Business Address', type: 'text', col: 'col-12' },
        { key: 'contactNumber', label: 'Contact Number', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'dtiNumber', label: 'DTI Number', type: 'text' },
        { key: 'birTin', label: 'BIR TIN', type: 'text' },
        { key: 'permitNumber', label: 'Permit Number', type: 'text' },
        { key: 'dateRegistered', label: 'Date Registered', type: 'date' },
        { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Suspended', 'Closed'] },
    ],
    searchFields: ['businessName', 'businessType', 'dtiNumber', 'permitNumber'],
    filters: [
        { key: 'status', label: 'Status: All', field: 'status', options: ['Active', 'Expired', 'Suspended', 'Closed'] },
        { key: 'businessType', label: 'Type: All', field: 'businessType', options: BUSINESS_TYPES },
    ],
    stats: [
        { label: 'Total Businesses', icon: '🏪', compute: (items) => items.length },
        { label: 'Active', icon: '✅', compute: (items) => items.filter((i) => i.status === 'Active').length },
        { label: 'Expiring/Expired', icon: '⚠️', compute: (items) => items.filter((i) => expiryStatus(i.expirationDate).label !== 'Active').length },
    ],
    columns: [
        { label: 'Business ID', render: (item) => item.businessCode || '—' },
        { label: 'Business Name', render: (item) => item.businessName },
        { label: 'Owner', render: (item, l) => findLookupLabel(l, 'residents', item.ownerResidentId, 'fullName') || '—' },
        { label: 'Type', render: (item) => item.businessType || '—' },
        { label: 'Registered', render: (item) => (item.dateRegistered ? formatDate(item.dateRegistered) : '—') },
        {
            label: 'Expiration',
            render: (item) => {
                const s = expiryStatus(item.expirationDate);
                return createElement('span', { className: `status-pill ${s.cls}` }, s.label);
            },
        },
    ],
    deleteLabel: (item) => item.businessName,
};
