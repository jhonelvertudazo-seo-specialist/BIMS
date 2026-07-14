import { useMemo, useState } from 'react';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { auditLogsConfig } from '../lib/entityConfigs/auditLogs.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';

function formatTimestamp(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditTrailPage() {
    const { items, loading } = useGenericEntity(auditLogsConfig);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const filtered = useMemo(() => {
        return items.filter((i) => {
            if (actionFilter && i.action !== actionFilter) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [i.tableName, i.recordId, i.performedBy, i.action].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [items, search, actionFilter]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 10);

    const exportHeaders = ['When', 'Module', 'Action', 'Record ID', 'Performed By'];
    const exportRows = useMemo(() => filtered.map((log) => [
        formatTimestamp(log.performedAt), log.tableName, log.action, log.recordId || '', log.performedBy || '',
    ]), [filtered]);

    if (loading) return <LoadingSpinner label="Loading audit trail…" />;

    const filtersActive = !!(search || actionFilter);

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Audit Trail</h5>
                            <p className="text-muted small mb-0">System-recorded actions across Collections, Expenses, Certificates, and Blotter</p>
                        </div>
                        <ExportButtons title="Audit Trail" headers={exportHeaders} rows={exportRows} />
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search module, record, or user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                                <option value="">Action: All</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-3 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={() => { setSearch(''); setActionFilter(''); }} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">{filtered.length} log entr{filtered.length === 1 ? 'y' : 'ies'}</p>
                    {filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🗒️</p>
                            <p className="fs-5">No audit log entries yet.</p>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>When</th>
                                        <th>Module</th>
                                        <th>Action</th>
                                        <th>Record ID</th>
                                        <th>Performed By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((log) => (
                                        <tr key={log.id}>
                                            <td data-label="When">{formatTimestamp(log.performedAt)}</td>
                                            <td data-label="Module">{log.tableName}</td>
                                            <td data-label="Action" className="text-capitalize">{log.action}</td>
                                            <td data-label="Record ID"><span className="small text-muted">{log.recordId || '—'}</span></td>
                                            <td data-label="Performed By">{log.performedBy || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>
        </section>
    );
}
