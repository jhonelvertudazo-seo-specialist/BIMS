import { findLookupLabel } from '../genericDisplay.js';
import { formatCurrency } from '../../utils/format.js';

export const familiesConfig = {
    key: 'families',
    table: 'families',
    title: 'Family Profiling',
    subtitle: 'Track family units and poverty classification within each household',
    addLabel: '+ Add Family Record',
    emptyIcon: '👨‍👩‍👧‍👦',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [
        { key: 'residents', source: 'context' },
        { key: 'households', source: 'context' },
    ],
    fields: [
        { key: 'householdId', label: 'Household', type: 'lookup', lookup: 'households', displayField: 'householdNo', column: 'household_id', required: true, col: 'col-12 col-md-6' },
        { key: 'familyHeadResidentId', label: 'Family Head', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'family_head_resident_id', required: true, col: 'col-12 col-md-6' },
        { key: 'relationship', label: 'Relationship to Head', type: 'text' },
        { key: 'numChildren', label: 'Number of Children', type: 'number', col: 'col-6 col-md-3' },
        { key: 'numDependents', label: 'Number of Dependents', type: 'number', col: 'col-6 col-md-3' },
        { key: 'familyIncome', label: 'Family Income', type: 'currency', col: 'col-12 col-md-6' },
        {
            key: 'povertyClassification', label: 'Poverty Classification', type: 'select',
            options: ['Not Poor', 'Poor', 'Near Poor', 'NHTS-Listed'],
        },
        { key: 'indigenousGroup', label: 'Indigenous Group', type: 'text' },
        { key: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
    ],
    searchFields: ['relationship', 'povertyClassification', 'indigenousGroup'],
    columns: [
        { label: 'Household', render: (item, l) => findLookupLabel(l, 'households', item.householdId, 'householdNo') || '—' },
        { label: 'Family Head', render: (item, l) => findLookupLabel(l, 'residents', item.familyHeadResidentId, 'fullName') || '—' },
        { label: 'Children', render: (item) => item.numChildren || 0 },
        { label: 'Dependents', render: (item) => item.numDependents || 0 },
        { label: 'Poverty Class.', render: (item) => item.povertyClassification || '—' },
        { label: 'Family Income', render: (item) => (item.familyIncome ? formatCurrency(item.familyIncome) : '—') },
    ],
    deleteLabel: (item) => item.relationship || 'this family',
};
