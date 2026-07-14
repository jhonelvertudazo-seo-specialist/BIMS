export const certificateTemplatesConfig = {
    key: 'settings',
    table: 'certificate_templates',
    title: 'Certificate Template',
    subtitle: 'Header, body, and footer text used when printing certificates',
    addLabel: '+ Add Template',
    emptyIcon: '📄',
    hasView: false,
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'type', label: 'Certificate Type', type: 'text', required: true, col: 'col-12' },
        { key: 'headerText', label: 'Header Text', type: 'textarea', col: 'col-12' },
        { key: 'bodyTemplate', label: 'Body Template', type: 'textarea', col: 'col-12', rows: 5 },
        { key: 'footerText', label: 'Footer Text', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['type'],
    columns: [
        { label: 'Certificate Type', render: (item) => item.type },
        { label: 'Header Text', render: (item) => (item.headerText ? `${item.headerText.slice(0, 60)}${item.headerText.length > 60 ? '…' : ''}` : '—') },
    ],
    deleteLabel: (item) => item.type,
};
