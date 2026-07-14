import { findLookupLabel } from '../genericDisplay.js';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { printDocument } from '../../utils/actions.js';

function printReceipt(item, lookupData) {
    const residentName = findLookupLabel(lookupData, 'residents', item.residentId, 'fullName');
    const businessName = findLookupLabel(lookupData, 'businesses', item.businessId, 'business_name');
    const payerLine = residentName || businessName || '—';
    printDocument(`Official Receipt — ${item.orNumber}`, `
        <h1>Official Receipt</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            <tr><td class="label">Received From</td><td class="value">${payerLine}</td></tr>
            <tr><td class="label">Payment Type</td><td class="value">${item.paymentType || '—'}</td></tr>
            <tr><td class="label">Amount</td><td class="value">${formatCurrency(item.amount)}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${item.paymentMethod || '—'}</td></tr>
            <tr><td class="label">OR Number</td><td class="value">${item.orNumber}</td></tr>
            <tr><td class="label">Date Paid</td><td class="value">${item.datePaid ? formatDate(item.datePaid) : '—'}</td></tr>
            <tr><td class="label">Cashier</td><td class="value">${item.cashier || '—'}</td></tr>
        </table>
        <div class="sign-line"><div class="line">Authorized Signature</div></div>
    `);
}

export const collectionsConfig = {
    key: 'collections',
    table: 'collections',
    title: 'Collection',
    subtitle: 'Record barangay payments and issue official receipts',
    addLabel: '+ Record Collection',
    emptyIcon: '💰',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'orNumber',
    codePrefix: 'OR-',
    codePattern: /OR-(\d+)/,
    codePadLength: 6,
    auditLog: true,
    lookups: [
        { key: 'residents', source: 'context' },
        { key: 'businesses', source: 'table', table: 'businesses' },
    ],
    fields: [
        { key: 'orNumber', label: 'OR Number', type: 'text', auto: true },
        { key: 'residentId', label: 'Resident (if applicable)', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id' },
        { key: 'businessId', label: 'Business (if applicable)', type: 'lookup', lookup: 'businesses', displayField: 'business_name', column: 'business_id' },
        {
            key: 'paymentType', label: 'Payment Type', type: 'select', required: true,
            options: ['Certificate Fee', 'Business Permit Fee', 'Market Fee', 'Rental Fee', 'Fine/Penalty', 'Donation', 'Other'],
        },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'GCash', 'Bank Transfer', 'Check'] },
        { key: 'cashier', label: 'Cashier', type: 'text', required: true },
        { key: 'datePaid', label: 'Date Paid', type: 'date', required: true },
    ],
    searchFields: ['orNumber', 'paymentType', 'cashier'],
    filters: [
        { key: 'paymentType', label: 'Payment Type: All', field: 'paymentType', options: ['Certificate Fee', 'Business Permit Fee', 'Market Fee', 'Rental Fee', 'Fine/Penalty', 'Donation', 'Other'] },
    ],
    stats: [
        { label: 'Total Collected', icon: '💰', compute: (items) => formatCurrency(items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)) },
        { label: 'Transactions', icon: '🧾', compute: (items) => items.length },
    ],
    columns: [
        { label: 'OR Number', render: (item) => item.orNumber || '—' },
        {
            label: 'Payer',
            render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName')
                || findLookupLabel(l, 'businesses', item.businessId, 'business_name') || '—',
        },
        { label: 'Payment Type', render: (item) => item.paymentType || '—' },
        { label: 'Amount', render: (item) => formatCurrency(item.amount) },
        { label: 'Date Paid', render: (item) => (item.datePaid ? formatDate(item.datePaid) : '—') },
    ],
    rowActions: [
        { label: 'Print Receipt', icon: '🖨️', onClick: (item, lookupData) => printReceipt(item, lookupData) },
    ],
    deleteLabel: (item) => item.orNumber || 'this collection',
};

export const receiptsConfig = {
    ...collectionsConfig,
    key: 'receipts',
    title: 'Official Receipt',
    subtitle: 'Printable receipts for recorded collections',
    addLabel: '+ Record Collection',
    hasView: false,
};
