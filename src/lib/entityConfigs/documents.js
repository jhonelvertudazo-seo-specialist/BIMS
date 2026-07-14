import { createElement } from 'react';
import { formatDate } from '../../utils/format.js';

const baseFields = [
    { key: 'title', label: 'Title', type: 'text', required: true, col: 'col-12' },
    { key: 'category', label: 'Category', type: 'select', options: ['Ordinance', 'Resolution', 'Meeting Minutes', 'Uploaded File'], required: true },
    { key: 'file', label: 'File', type: 'file', column: 'file_url', uploadFolder: 'documents', col: 'col-12' },
    { key: 'fileType', label: 'File Type', type: 'text', placeholder: 'e.g. PDF, DOCX' },
    { key: 'uploadedBy', label: 'Uploaded By', type: 'text' },
    { key: 'uploadDate', label: 'Upload Date', type: 'date' },
    { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
    { key: 'version', label: 'Version', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Archived'] },
    { key: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
];

const baseColumns = [
    { label: 'Title', render: (item) => item.title },
    { label: 'Category', render: (item) => item.category || '—' },
    { label: 'Uploaded', render: (item) => (item.uploadDate ? formatDate(item.uploadDate) : '—') },
    { label: 'Status', render: (item) => item.status || 'Active' },
    {
        label: 'File',
        render: (item) => (item.file
            ? createElement('a', { href: item.file, target: '_blank', rel: 'noopener noreferrer' }, 'Open')
            : '—'),
    },
];

const shared = {
    table: 'documents',
    emptyIcon: '🗄️',
    orderBy: { column: 'created_at', ascending: true },
    fields: baseFields,
    searchFields: ['title', 'description'],
    columns: baseColumns,
    deleteLabel: (item) => item.title,
};

export const documentsConfig = {
    ...shared,
    key: 'documents',
    title: 'Document',
    subtitle: 'All uploaded barangay documents',
    addLabel: '+ Upload File',
    filterItems: (items) => items.filter((i) => i.status !== 'Archived'),
};

export const ordinancesConfig = {
    ...shared,
    key: 'ordinances',
    permissionKey: 'documents',
    title: 'Ordinance',
    subtitle: 'Barangay ordinances',
    addLabel: '+ Upload Ordinance',
    filterItems: (items) => items.filter((i) => i.category === 'Ordinance' && i.status !== 'Archived'),
};

export const resolutionsConfig = {
    ...shared,
    key: 'resolutions',
    permissionKey: 'documents',
    title: 'Resolution',
    subtitle: 'Barangay resolutions',
    addLabel: '+ Upload Resolution',
    filterItems: (items) => items.filter((i) => i.category === 'Resolution' && i.status !== 'Archived'),
};

export const meetingMinutesConfig = {
    ...shared,
    key: 'meetingMinutes',
    permissionKey: 'documents',
    title: 'Meeting Minutes',
    subtitle: 'Session and meeting minutes',
    addLabel: '+ Upload Minutes',
    filterItems: (items) => items.filter((i) => i.category === 'Meeting Minutes' && i.status !== 'Archived'),
};

export const archiveConfig = {
    ...shared,
    key: 'archive',
    permissionKey: 'documents',
    title: 'Archived Document',
    subtitle: 'Archived documents from every category',
    addLabel: '+ Upload File',
    filterItems: (items) => items.filter((i) => i.status === 'Archived'),
};
