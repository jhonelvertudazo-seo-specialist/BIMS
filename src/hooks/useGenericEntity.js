import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { fromRow, toRow } from '../lib/genericMapper.js';
import { nextSequentialCode } from '../lib/codeGen.js';
import { logAudit } from '../lib/auditLog.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useGenericEntity(config, { enabled = true } = {}) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(enabled);

    const reload = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        const orderColumn = config.orderBy?.column || 'created_at';
        const ascending = config.orderBy?.ascending ?? true;
        const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .is('deleted_at', null)
            .order(orderColumn, { ascending });
        if (error) {
            console.error(`Failed to load ${config.table}:`, error.message);
            setItems([]);
        } else {
            setItems((data || []).map((row) => fromRow(config, row)));
        }
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.table, enabled]);

    useEffect(() => {
        reload();
    }, [reload]);

    async function add(formData) {
        let data = formData;
        if (config.codeField) {
            const code = nextSequentialCode(
                items,
                config.codeField,
                config.codePattern,
                config.codePrefix,
                config.codePadLength || 4
            );
            data = { ...formData, [config.codeField]: code };
        }
        const row = toRow(config, data);
        const { data: inserted, error } = await supabase.from(config.table).insert(row).select().single();
        if (error) throw error;
        const record = fromRow(config, inserted);
        setItems((prev) => [...prev, record]);
        if (config.auditLog) logAudit(config.table, record.id, 'create', user?.email);
        return record;
    }

    async function update(id, formData) {
        const existing = items.find((i) => i.id === id);
        const row = toRow(config, { ...existing, ...formData });
        const { data: updated, error } = await supabase.from(config.table).update(row).eq('id', id).select().single();
        if (error) throw error;
        const record = fromRow(config, updated);
        setItems((prev) => prev.map((i) => (i.id === id ? record : i)));
        if (config.auditLog) logAudit(config.table, id, 'update', user?.email);
        return record;
    }

    // Soft delete — marks the row instead of removing it, so it can be
    // recovered from the Recycle Bin (src/pages/RecycleBinPage.jsx).
    async function remove(id) {
        const { error } = await supabase.from(config.table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (config.auditLog) logAudit(config.table, id, 'delete', user?.email);
    }

    return { items, loading, reload, add, update, remove };
}
