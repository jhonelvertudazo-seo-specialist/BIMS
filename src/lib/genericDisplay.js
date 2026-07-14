import { formatDate, formatCurrency } from '../utils/format.js';

export function findLookupLabel(lookupData, lookupKey, id, displayField) {
    const list = (lookupData && lookupData[lookupKey]) || [];
    const match = list.find((o) => String(o.id) === String(id));
    if (!match) return '';
    return match[displayField] || match.fullName || match.name || '';
}

export function lookupLabel(field, value, lookupData) {
    return findLookupLabel(lookupData, field.lookup, value, field.displayField);
}

export function resolveFieldDisplay(field, item, lookupData) {
    const value = item[field.key];
    if (field.type === 'lookup') {
        return lookupLabel(field, value, lookupData) || '—';
    }
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    if (field.type === 'date') return value ? formatDate(value) : '—';
    if (field.type === 'currency') return value || value === 0 ? formatCurrency(value) : '—';
    if (value === '' || value === null || value === undefined) return '—';
    return String(value);
}
