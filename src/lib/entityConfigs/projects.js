import { createElement } from 'react';
import { findLookupLabel } from '../genericDisplay.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

const baseFields = [
    { key: 'projectName', label: 'Project Name', type: 'text', required: true, col: 'col-12 col-md-6' },
    { key: 'programType', label: 'Program Type', type: 'select', options: ['Community Project', 'Livelihood Program', 'Scholarship Program'], required: true },
    { key: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
    { key: 'budget', label: 'Budget', type: 'currency' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'Ongoing', 'Completed', 'On Hold', 'Cancelled'] },
    { key: 'projectManager', label: 'Project Manager', type: 'text' },
    { key: 'completionPercentage', label: 'Completion %', type: 'number' },
];

const baseColumns = [
    { label: 'Project Name', render: (item) => item.projectName },
    { label: 'Status', render: (item) => item.status || '—' },
    { label: 'Budget', render: (item) => formatCurrency(item.budget) },
    { label: 'Manager', render: (item) => item.projectManager || '—' },
    {
        label: 'Progress',
        render: (item) => createElement(
            'div',
            { className: 'hbar-track', style: { width: 100 } },
            createElement('div', { className: 'hbar-fill', style: { width: `${Math.min(100, Number(item.completionPercentage) || 0)}%` } })
        ),
    },
];

const shared = {
    table: 'projects',
    emptyIcon: '📈',
    orderBy: { column: 'created_at', ascending: true },
    fields: baseFields,
    searchFields: ['projectName', 'projectManager', 'status'],
    columns: baseColumns,
    deleteLabel: (item) => item.projectName,
};

export const projectsConfig = {
    ...shared,
    key: 'projects',
    title: 'Community Project',
    subtitle: 'Barangay community projects and initiatives',
    addLabel: '+ Add Project',
    filterItems: (items) => items.filter((i) => i.programType !== 'Livelihood Program' && i.programType !== 'Scholarship Program'),
};

export const livelihoodProgramsConfig = {
    ...shared,
    key: 'livelihoodPrograms',
    permissionKey: 'projects',
    title: 'Livelihood Program',
    subtitle: 'Livelihood assistance programs',
    addLabel: '+ Add Livelihood Program',
    filterItems: (items) => items.filter((i) => i.programType === 'Livelihood Program'),
};

export const scholarshipProgramsConfig = {
    ...shared,
    key: 'scholarshipPrograms',
    permissionKey: 'projects',
    title: 'Scholarship Program',
    subtitle: 'Scholarship and education assistance programs',
    addLabel: '+ Add Scholarship Program',
    filterItems: (items) => items.filter((i) => i.programType === 'Scholarship Program'),
};

export const progressMonitoringConfig = {
    ...shared,
    key: 'progressMonitoring',
    permissionKey: 'projects',
    title: 'Progress Monitoring',
    subtitle: 'All projects and programs, sorted by completion',
    addLabel: '+ Add Project',
    hasView: true,
};

export const projectBeneficiariesConfig = {
    key: 'beneficiaries',
    table: 'project_beneficiaries',
    title: 'Beneficiary',
    subtitle: 'Residents benefiting from a project or program',
    addLabel: '+ Add Beneficiary',
    emptyIcon: '🤝',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [
        { key: 'residents', source: 'context' },
        { key: 'projects', source: 'table', table: 'projects' },
    ],
    fields: [
        { key: 'projectId', label: 'Project / Program', type: 'lookup', lookup: 'projects', displayField: 'project_name', column: 'project_id', required: true, col: 'col-12' },
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'dateAdded', label: 'Date Added', type: 'date' },
    ],
    searchFields: [],
    columns: [
        { label: 'Project / Program', render: (item, l) => findLookupLabel(l, 'projects', item.projectId, 'project_name') || '—' },
        { label: 'Resident', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        { label: 'Date Added', render: (item) => (item.dateAdded ? formatDate(item.dateAdded) : '—') },
    ],
    deleteLabel: () => 'this beneficiary record',
};
