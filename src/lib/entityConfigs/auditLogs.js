export const auditLogsConfig = {
    key: 'auditLogs',
    table: 'audit_logs',
    title: 'Audit Trail',
    orderBy: { column: 'performed_at', ascending: false },
    fields: [
        { key: 'tableName', label: 'Module', type: 'text', column: 'table_name' },
        { key: 'recordId', label: 'Record ID', type: 'text', column: 'record_id' },
        { key: 'action', label: 'Action', type: 'text' },
        { key: 'performedBy', label: 'Performed By', type: 'text', column: 'performed_by' },
        { key: 'performedAt', label: 'Performed At', type: 'text', column: 'performed_at' },
        { key: 'details', label: 'Details', type: 'text' },
    ],
};
