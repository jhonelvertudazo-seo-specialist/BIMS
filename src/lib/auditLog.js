import { supabase } from './supabaseClient.js';

export async function logAudit(tableName, recordId, action, performedBy, details) {
    const { error } = await supabase.from('audit_logs').insert({
        table_name: tableName,
        record_id: recordId ? String(recordId) : null,
        action,
        performed_by: performedBy || null,
        details: details || null,
    });
    if (error) console.error('Failed to write audit log:', error.message);
}
