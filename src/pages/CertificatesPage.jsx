import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StatTile from '../components/common/StatTile.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import CertificatesTable from '../components/certificates/CertificatesTable.jsx';
import { usePagination } from '../hooks/usePagination.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { CERTIFICATE_TYPES } from '../utils/constants.js';

export default function CertificatesPage() {
    const { certificates, loading } = useData();
    const { openCertificateModal } = useUI();
    const { can } = useAuth();
    const canAdd = can('certificates', 'add');

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filtered = useMemo(() => {
        return certificates.filter((c) => {
            if (typeFilter && c.type !== typeFilter) return false;
            if (dateFrom && c.issuedAt < new Date(dateFrom).setHours(0, 0, 0, 0)) return false;
            if (dateTo && c.issuedAt > new Date(dateTo).setHours(23, 59, 59, 999)) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [c.residentName, c.referenceNo, c.type, c.purpose].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [certificates, search, typeFilter, dateFrom, dateTo]);

    const sorted = useMemo(() => [...filtered].sort((a, b) => b.issuedAt - a.issuedAt), [filtered]);
    const { pageItems, page, setPage, totalPages } = usePagination(sorted, 6);

    const exportHeaders = ['Date', 'Type', 'Resident', 'Purpose', 'Fee', 'Reference No.'];
    const exportRows = useMemo(() => sorted.map((c) => [
        formatDate(new Date(c.issuedAt).toISOString()), c.type, c.residentName, c.purpose || '', c.fee, c.referenceNo,
    ]), [sorted]);

    const filtersActive = !!(search || typeFilter || dateFrom || dateTo);
    function clearFilters() {
        setSearch('');
        setTypeFilter('');
        setDateFrom('');
        setDateTo('');
    }

    if (loading) {
        return <LoadingSpinner label="Loading certificates…" />;
    }

    const totalRevenue = certificates.reduce((sum, c) => sum + Number(c.fee || 0), 0);
    const now = new Date();
    const issuedThisMonth = certificates.filter((c) => {
        const d = new Date(c.issuedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    return (
        <section className="app-view">
            <div className="row g-3 mb-4">
                <div className="col-6 col-xl-4">
                    <StatTile icon="📄" iconBg="bg-primary-subtle text-primary" label="Certificates Issued" value={certificates.length} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="💵" iconBg="bg-success-subtle text-success" label="Total Revenue Collected" value={formatCurrency(totalRevenue)} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="🗓️" iconBg="bg-info-subtle text-info" label="Issued This Month" value={issuedThisMonth} />
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Certificates</h5>
                            <p className="text-muted small mb-0">Certificates and clearances issued to residents</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Certificates" headers={exportHeaders} rows={exportRows} />
                            {canAdd && <button type="button" className="btn btn-accent" onClick={openCertificateModal}>+ Issue Certificate</button>}
                        </div>
                    </div>
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search resident, reference no., purpose..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="">All Types</option>
                                {CERTIFICATE_TYPES.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                aria-label="Issued from date"
                                title="From date"
                            />
                        </div>
                        <div className="col-6 col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                aria-label="Issued to date"
                                title="To date"
                            />
                        </div>
                        <div className="col-6 col-md-1 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">
                        {certificates.length ? `Showing ${filtered.length} of ${certificates.length} certificate${certificates.length === 1 ? '' : 's'}` : ''}
                    </p>
                    {certificates.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">📭</p>
                            <p className="fs-5">No certificates issued yet.</p>
                            <p>Click "Issue Certificate" to create your first one.</p>
                        </div>
                    )}
                    {certificates.length > 0 && filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🔍</p>
                            <p className="fs-5">No matching certificates.</p>
                            <p>Try a different search or filter.</p>
                        </div>
                    )}
                    <div className="table-responsive">
                        <CertificatesTable certificates={pageItems} />
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>
        </section>
    );
}
