import { formatCurrency } from '../../utils/format.js';

export const budgetsConfig = {
    key: 'budgets',
    table: 'budgets',
    title: 'Budget',
    subtitle: 'Annual budget allocation per category',
    addLabel: '+ Add Budget Line',
    emptyIcon: '📊',
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true, placeholder: 'e.g. 2026' },
        { key: 'category', label: 'Category', type: 'text', required: true },
        { key: 'allocatedBudget', label: 'Allocated Budget', type: 'currency', required: true },
        { key: 'remainingBudget', label: 'Remaining Budget', type: 'currency' },
    ],
    searchFields: ['fiscalYear', 'category'],
    filters: [],
    stats: [
        { label: 'Total Allocated', icon: '📊', compute: (items) => formatCurrency(items.reduce((sum, i) => sum + (Number(i.allocatedBudget) || 0), 0)) },
        { label: 'Total Remaining', icon: '💵', compute: (items) => formatCurrency(items.reduce((sum, i) => sum + (Number(i.remainingBudget) || 0), 0)) },
    ],
    columns: [
        { label: 'Fiscal Year', render: (item) => item.fiscalYear || '—' },
        { label: 'Category', render: (item) => item.category || '—' },
        { label: 'Allocated', render: (item) => formatCurrency(item.allocatedBudget) },
        { label: 'Remaining', render: (item) => formatCurrency(item.remainingBudget) },
    ],
    deleteLabel: (item) => `${item.category} (${item.fiscalYear})`,
};
