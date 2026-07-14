import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StatTile from '../components/common/StatTile.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import BlotterTable from '../components/blotter/BlotterTable.jsx';
import { usePagination } from '../hooks/usePagination.js';
import { formatDate } from '../utils/format.js';
import { INCIDENT_TYPES } from '../utils/constants.js';

export default function BlotterPage() {
    const { blotters, settleBlotter, loading } = useData();
    const { openBlotterModal, showToast } = useUI();
    const { can } = useAuth();
    const canAdd = can('blotter', 'add');
    const canEdit = can('blotter', 'edit');
    const canDelete = can('blotter', 'delete');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [incidentTypeFilter, setIncidentTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [settlingId, setSettlingId] = useState(null);

    const filtered = useMemo(() => {
        return blotters.filter((b) => {
            if (statusFilter && b.status !== statusFilter) return false;
            if (incidentTypeFilter && b.incidentType !== incidentTypeFilter) return false;
            if (dateFrom && b.incidentDate < dateFrom) return false;
            if (dateTo && b.incidentDate > dateTo) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [b.caseNo, b.complainant, b.respondent, b.incidentType, b.details].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [blotters, search, statusFilter, incidentTypeFilter, dateFrom, dateTo]);

    const sorted = useMemo(() => [...filtered].sort((a, b) => b.filedAt - a.filedAt), [filtered]);
    const { pageItems, page, setPage, totalPages } = usePagination(sorted, 6);

    const exportHeaders = ['Case No.', 'Date', 'Complainant', 'Respondent', 'Incident Type', 'Status'];
    const exportRows = useMemo(() => sorted.map((b) => [
        b.caseNo, formatDate(b.incidentDate), b.complainant, b.respondent, b.incidentType, b.status,
    ]), [sorted]);

    const filtersActive = !!(search || statusFilter || incidentTypeFilter || dateFrom || dateTo);
    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        setIncidentTypeFilter('');
        setDateFrom('');
        setDateTo('');
    }

    if (loading) {
        return <LoadingSpinner label="Loading blotter records…" />;
    }

    const active = blotters.filter((b) => b.status === 'Active').length;
    const settled = blotters.filter((b) => b.status === 'Settled').length;

    async function handleSettle(id) {
        setSettlingId(id);
        try {
            await settleBlotter(id);
            showToast('Case marked as settled.');
        } catch (err) {
            showToast(err.message || 'Failed to update case.', true);
        } finally {
            setSettlingId(null);
        }
    }

    return (
        <section className="app-view">
            <div className="row g-3 mb-4">
                <div className="col-6 col-xl-4">
                    <StatTile icon="🕓" iconBg="bg-warning-subtle text-warning" label="Active Cases" value={active} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="✅" iconBg="bg-success-subtle text-success" label="Settled Cases" value={settled} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="📁" iconBg="bg-primary-subtle text-primary" label="Total Cases" value={blotters.length} />
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Blotter Records</h5>
                            <p className="text-muted small mb-0">Incident reports filed at the barangay hall</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Blotter Records" headers={exportHeaders} rows={exportRows} />
                            {canAdd && <button type="button" className="btn btn-accent text-nowrap" onClick={openBlotterModal}>+ File Blotter</button>}
                        </div>
                    </div>
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search complainant, respondent, case no..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">Status: All</option>
                                <option value="Active">Active</option>
                                <option value="Settled">Settled</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select" value={incidentTypeFilter} onChange={(e) => setIncidentTypeFilter(e.target.value)}>
                                <option value="">All Incident Types</option>
                                {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                aria-label="Incident from date"
                                title="From date"
                            />
                        </div>
                        <div className="col-6 col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                aria-label="Incident to date"
                                title="To date"
                            />
                        </div>
                        <div className="col-12 d-flex justify-content-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">
                        {blotters.length ? `Showing ${filtered.length} of ${blotters.length} case${blotters.length === 1 ? '' : 's'}` : ''}
                    </p>
                    {blotters.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">📭</p>
                            <p className="fs-5">No blotter cases yet.</p>
                            <p>Click "File Blotter" to log your first case.</p>
                        </div>
                    )}
                    {blotters.length > 0 && filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🔍</p>
                            <p className="fs-5">No matching cases.</p>
                            <p>Try a different search or filter.</p>
                        </div>
                    )}
                    <div className="table-responsive">
                        <BlotterTable blotters={pageItems} settlingId={settlingId} onSettle={handleSettle} canEdit={canEdit} canDelete={canDelete} />
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>
        </section>
    );
}
