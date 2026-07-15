import { useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
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
import { moduleKeyForCertificateType, ISSUED_CERTIFICATES_MODULE_KEY } from '../lib/certificateModules.js';

const ISSUED_TAB = '__issued__';

export default function CertificatesPage() {
    const { certificates, residents, loading } = useData();
    const { openCertificateModal } = useUI();
    const { can } = useAuth();

    // Each type tab (and the Issued Certificates tab) is gated by its own
    // permission module — see src/lib/certificateModules.js — so a role
    // can be granted some certificate types but not others. Only
    // Administrator has every one of these by default; everything else
    // starts at zero access until an Administrator grants it via
    // Permissions.
    const viewableTypes = useMemo(
        () => CERTIFICATE_TYPES.filter((t) => can(moduleKeyForCertificateType(t), 'view')),
        [can]
    );
    const canViewIssued = can(ISSUED_CERTIFICATES_MODULE_KEY, 'view');
    const visibleCertificates = useMemo(
        () => certificates.filter((c) => can(moduleKeyForCertificateType(c.type), 'view')),
        [certificates, can]
    );

    const [activeTab, setActiveTab] = useState('');
    const isIssuedTab = activeTab === ISSUED_TAB;
    const typeFilter = isIssuedTab ? '' : activeTab;
    const canAddActiveType = !!typeFilter && can(moduleKeyForCertificateType(typeFilter), 'add');

    // Every tab (All, each certificate/clearance type, and Issued
    // Certificates) shares the same filter toolbar: search, resident, and
    // issued date range. Only the type filter changes per tab.
    const [search, setSearch] = useState('');
    const [residentFilter, setResidentFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const typeCounts = useMemo(() => {
        const counts = {};
        visibleCertificates.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
        return counts;
    }, [visibleCertificates]);

    const sortedResidents = useMemo(
        () => [...residents].sort((a, b) => a.fullName.localeCompare(b.fullName)),
        [residents]
    );

    const filtered = useMemo(() => {
        return visibleCertificates.filter((c) => {
            if (typeFilter && c.type !== typeFilter) return false;
            if (residentFilter && c.residentId !== residentFilter) return false;
            if (dateFrom && c.issuedAt < new Date(dateFrom).setHours(0, 0, 0, 0)) return false;
            if (dateTo && c.issuedAt > new Date(dateTo).setHours(23, 59, 59, 999)) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [c.residentName, c.referenceNo, c.type, c.purpose].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [visibleCertificates, search, typeFilter, residentFilter, dateFrom, dateTo]);

    const sorted = useMemo(() => [...filtered].sort((a, b) => b.issuedAt - a.issuedAt), [filtered]);
    const { pageItems, page, setPage, totalPages } = usePagination(sorted, 6);

    const exportHeaders = ['Date', 'Type', 'Resident', 'Purpose', 'Fee', 'Reference No.'];
    const exportRows = useMemo(() => sorted.map((c) => [
        formatDate(new Date(c.issuedAt).toISOString()), c.type, c.residentName, c.purpose || '', c.fee, c.referenceNo,
    ]), [sorted]);

    const filtersActive = !!(search || residentFilter || dateFrom || dateTo);
    function clearFilters() {
        setSearch('');
        setResidentFilter('');
        setDateFrom('');
        setDateTo('');
    }

    if (loading) {
        return <LoadingSpinner label="Loading certificates…" />;
    }

    const totalRevenue = visibleCertificates.reduce((sum, c) => sum + Number(c.fee || 0), 0);
    const now = new Date();
    const issuedThisMonth = visibleCertificates.filter((c) => {
        const d = new Date(c.issuedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    return (
        <section className="app-view">
            <div className="row g-3 mb-4">
                <div className="col-6 col-xl-4">
                    <StatTile icon="📄" iconBg="bg-primary-subtle text-primary" label="Certificates Issued" value={visibleCertificates.length} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="💵" iconBg="bg-success-subtle text-success" label="Total Revenue Collected" value={formatCurrency(totalRevenue)} />
                </div>
                <div className="col-6 col-xl-4">
                    <StatTile icon="🗓️" iconBg="bg-info-subtle text-info" label="Issued This Month" value={issuedThisMonth} />
                </div>
            </div>

            <Nav variant="tabs" className="mb-3 scroll-tabs" activeKey={activeTab} onSelect={(key) => setActiveTab(key || '')}>
                <Nav.Item>
                    <Nav.Link eventKey="">All ({visibleCertificates.length})</Nav.Link>
                </Nav.Item>
                {viewableTypes.map((t) => (
                    <Nav.Item key={t}>
                        <Nav.Link eventKey={t}>{t} ({typeCounts[t] || 0})</Nav.Link>
                    </Nav.Item>
                ))}
                {canViewIssued && (
                    <Nav.Item>
                        <Nav.Link eventKey={ISSUED_TAB}>Issued Certificates</Nav.Link>
                    </Nav.Item>
                )}
            </Nav>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">{isIssuedTab ? 'Issued Certificates' : 'Certificates'}</h5>
                            <p className="text-muted small mb-0">Certificates and clearances issued to residents</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Certificates" headers={exportHeaders} rows={exportRows} />
                            {canAddActiveType && (
                                <button type="button" className="btn btn-accent" onClick={() => openCertificateModal(typeFilter)}>
                                    + Issue {typeFilter}
                                </button>
                            )}
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
                        <div className="col-12 col-md-3">
                            <select className="form-select" value={residentFilter} onChange={(e) => setResidentFilter(e.target.value)}>
                                <option value="">All Residents</option>
                                {sortedResidents.map((r) => (
                                    <option key={r.id} value={r.id}>{r.residentId} — {r.fullName}</option>
                                ))}
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
                        <div className="col-12 col-md-1 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">
                        {visibleCertificates.length ? `Showing ${filtered.length} of ${visibleCertificates.length} certificate${visibleCertificates.length === 1 ? '' : 's'}` : ''}
                    </p>
                    {visibleCertificates.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">📭</p>
                            <p className="fs-5">No certificates issued yet.</p>
                            <p>Click &quot;Issue Certificate&quot; to create your first one.</p>
                        </div>
                    )}
                    {visibleCertificates.length > 0 && filtered.length === 0 && (
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
