import { useMemo, useState } from 'react';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { loginHistoryConfig } from '../lib/entityConfigs/loginHistory.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';

function formatWhen(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LoginHistoryPage() {
    const { items, loading } = useGenericEntity(loginHistoryConfig);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search) return items;
        const term = search.toLowerCase();
        return items.filter((i) => (i.email || '').toLowerCase().includes(term));
    }, [items, search]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 10);

    const exportHeaders = ['Email', 'Login At'];
    const exportRows = useMemo(() => filtered.map((log) => [log.email, formatWhen(log.loginAt)]), [filtered]);

    if (loading) return <LoadingSpinner label="Loading login history…" />;

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Login History</h5>
                            <p className="text-muted small mb-0">Sign-in activity for all approved users</p>
                        </div>
                        <ExportButtons title="Login History" headers={exportHeaders} rows={exportRows} />
                    </div>
                    <div className="input-group">
                        <span className="input-group-text bg-white">🔍</span>
                        <input type="text" className="form-control" placeholder="Search email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}</p>
                    {filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🕓</p>
                            <p className="fs-5">No login activity recorded yet.</p>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>Email</th>
                                        <th>Login At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((log) => (
                                        <tr key={log.id}>
                                            <td data-label="Email">{log.email}</td>
                                            <td data-label="Login At">{formatWhen(log.loginAt)}</td>
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
