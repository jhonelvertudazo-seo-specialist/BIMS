export const puroksConfig = {
    key: 'puroks',
    table: 'puroks',
    title: 'Purok',
    subtitle: 'Purok/zone masterlist with assigned leader and population counts',
    addLabel: '+ Add Purok',
    emptyIcon: '📍',
    orderBy: { column: 'purok_name', ascending: true },
    lookups: [
        { key: 'residents', source: 'context' },
        { key: 'households', source: 'context' },
    ],
    fields: [
        { key: 'purokName', label: 'Purok Name', type: 'text', required: true, column: 'purok_name' },
        { key: 'purokLeader', label: 'Purok Leader', type: 'text' },
        { key: 'contactNumber', label: 'Contact Number', type: 'tel' },
        { key: 'zoneNumber', label: 'Zone Number', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
        { key: 'description', label: 'Description / Boundaries', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['purokName', 'purokLeader'],
    stats: [
        { label: 'Total Puroks', icon: '📍', compute: (items) => items.length },
    ],
    columns: [
        { label: 'Purok Name', render: (item) => item.purokName },
        { label: 'Purok Leader', render: (item) => item.purokLeader || '—' },
        { label: 'Contact', render: (item) => item.contactNumber || '—' },
        { label: 'Residents', render: (item, l) => (l.residents || []).filter((r) => r.purok === item.purokName).length },
        { label: 'Households', render: (item, l) => (l.households || []).filter((h) => h.purok === item.purokName).length },
        { label: 'Status', render: (item) => item.status || 'Active' },
    ],
    deleteLabel: (item) => item.purokName,
};
