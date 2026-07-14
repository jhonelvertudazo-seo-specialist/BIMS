import { formatDate, formatCurrency } from '../../utils/format.js';

export const expensesConfig = {
    key: 'expenses',
    table: 'expenses',
    title: 'Expense',
    subtitle: 'Track barangay operating expenses',
    addLabel: '+ Record Expense',
    emptyIcon: '🧾',
    orderBy: { column: 'created_at', ascending: true },
    auditLog: true,
    fields: [
        {
            key: 'category', label: 'Category', type: 'select', required: true,
            options: ['Honoraria', 'Utilities', 'Office Supplies', 'Infrastructure', 'Health & Sanitation', 'Disaster Response', 'Events', 'Other'],
        },
        { key: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { key: 'supplier', label: 'Supplier / Payee', type: 'text' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'approvedBy', label: 'Approved By', type: 'text' },
    ],
    searchFields: ['category', 'supplier', 'description'],
    filters: [
        { key: 'category', label: 'Category: All', field: 'category', options: ['Honoraria', 'Utilities', 'Office Supplies', 'Infrastructure', 'Health & Sanitation', 'Disaster Response', 'Events', 'Other'] },
    ],
    stats: [
        { label: 'Total Expenses', icon: '🧾', compute: (items) => formatCurrency(items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)) },
        { label: 'Entries', icon: '📄', compute: (items) => items.length },
    ],
    columns: [
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
        { label: 'Category', render: (item) => item.category || '—' },
        { label: 'Description', render: (item) => item.description || '—' },
        { label: 'Supplier', render: (item) => item.supplier || '—' },
        { label: 'Amount', render: (item) => formatCurrency(item.amount) },
    ],
    deleteLabel: (item) => item.category || 'this expense',
};
