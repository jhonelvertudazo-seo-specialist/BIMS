export const rolesConfig = {
    key: 'roles',
    table: 'roles',
    title: 'Role',
    subtitle: 'Roles used to group module permissions',
    addLabel: '+ Add Role',
    emptyIcon: '🛡️',
    hasView: false,
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'roleName', label: 'Role Name', type: 'text', required: true, column: 'role_name' },
        { key: 'description', label: 'Description', type: 'textarea' },
    ],
    searchFields: ['roleName', 'description'],
    columns: [
        { label: 'Role Name', render: (item) => item.roleName },
        { label: 'Description', render: (item) => item.description || '—' },
    ],
    deleteLabel: (item) => item.roleName,
};
