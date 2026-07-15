import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { genericRoutes } from '../lib/genericRoutes.js';
import { fromRow } from '../lib/genericMapper.js';
import {
    residentFromRow, certificateFromRow, blotterFromRow, householdFromRow,
} from '../lib/mappers.js';
import { formatDate } from '../utils/format.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

// Soft-deleted rows live behind the same tables every module already
// uses (see supabase/migrations/0016_soft_delete.sql); this page is just
// a generic "deleted_at is not null" viewer + restore/purge for each of
// them, reusing genericRoutes for the ~25 generic modules instead of
// redeclaring a duplicate table/title list.
const BESPOKE_MODULES = [
    { key: 'residents', table: 'residents', title: 'Residents', mapper: residentFromRow, label: (r) => r.fullName },
    { key: 'households', table: 'households', title: 'Households', mapper: householdFromRow, label: (h) => h.headOfFamily },
    { key: 'certificates', table: 'certificates', title: 'Certificates', mapper: certificateFromRow, label: (c) => `${c.type} — ${c.residentName}` },
    { key: 'blotters', table: 'blotters', title: 'Blotter Records', mapper: blotterFromRow, label: (b) => `${b.complainant} vs ${b.respondent}` },
];

function buildGenericModules() {
    const seenTables = new Set();
    return genericRoutes
        .map((r) => r.config)
        .filter((config) => {
            if (seenTables.has(config.table)) return false;
            seenTables.add(config.table);
            return true;
        })
        .map((config) => ({
            key: config.table,
            table: config.table,
            title: config.title,
            mapper: (row) => fromRow(config, row),
            label: (item) => (config.deleteLabel ? config.deleteLabel(item) : item.id),
        }));
}

export default function RecycleBinPage() {
    const { can } = useAuth();
    const { showToast } = useUI();
    const canRestore = can('recycleBin', 'edit');
    const canPurge = can('recycleBin', 'delete');

    const modules = useMemo(() => [...BESPOKE_MODULES, ...buildGenericModules()], []);
    const [moduleKey, setModuleKey] = useState(modules[0]?.key || '');
    const activeModule = modules.find((m) => m.key === moduleKey) || modules[0];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!activeModule) return;
        setLoading(true);
        const { data, error } = await supabase
            .from(activeModule.table)
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
        if (error) {
            console.error(`Failed to load deleted ${activeModule.table}:`, error.message);
            showToast(`Failed to load deleted ${activeModule.title.toLowerCase()}.`, true);
            setItems([]);
        } else {
            setItems((data || []).map((row) => ({ ...activeModule.mapper(row), deletedAt: row.deleted_at })));
        }
        setLoading(false);
    }, [activeModule, showToast]);

    useEffect(() => { load(); }, [load]);

    async function handleRestore(id) {
        const { error } = await supabase.from(activeModule.table).update({ deleted_at: null }).eq('id', id);
        if (error) {
            showToast(error.message || 'Failed to restore record.', true);
            return;
        }
        setItems((prev) => prev.filter((i) => i.id !== id));
        showToast('Record restored.');
    }

    async function handlePurge(id) {
        if (!window.confirm('Permanently delete this record? This cannot be undone.')) return;
        const { error } = await supabase.from(activeModule.table).delete().eq('id', id);
        if (error) {
            showToast(error.message || 'Failed to permanently delete record.', true);
            return;
        }
        setItems((prev) => prev.filter((i) => i.id !== id));
        showToast('Record permanently deleted.');
    }

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Recycle Bin</h5>
                    <p className="text-muted small mb-2">Deleted records are kept here until restored or permanently removed.</p>
                    <select className="form-select" style={{ maxWidth: 320 }} value={moduleKey} onChange={(e) => setModuleKey(e.target.value)}>
                        {modules.map((m) => <option key={m.key} value={m.key}>{m.title}</option>)}
                    </select>
                </div>
                <div className="card-body">
                    {loading ? (
                        <LoadingSpinner label={`Loading deleted ${activeModule?.title.toLowerCase()}…`} />
                    ) : items.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🗑️</p>
                            <p className="fs-5">Nothing deleted here.</p>
                            <p>Deleted {activeModule?.title.toLowerCase()} will show up in this list.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>Record</th>
                                        <th>Deleted At</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td data-label="Record">{activeModule.label(item) || '—'}</td>
                                            <td data-label="Deleted At">{item.deletedAt ? formatDate(item.deletedAt) : '—'}</td>
                                            <td className="actions-cell text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    {canRestore && (
                                                        <button type="button" className="btn btn-sm btn-outline-success" onClick={() => handleRestore(item.id)}>
                                                            ♻️ Restore
                                                        </button>
                                                    )}
                                                    {canPurge && (
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handlePurge(item.id)}>
                                                            🗑️ Delete Permanently
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
