import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import HouseholdsTable from '../components/households/HouseholdsTable.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import ColumnChart from '../components/charts/ColumnChart.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';
import { buildPurokDistribution, buildHouseholdTrend } from '../utils/dashboardStats.js';
import { PUROKS } from '../utils/constants.js';

export default function HouseholdsPage() {
    const { households, loading } = useData();
    const { openAddHousehold } = useUI();
    const { can } = useAuth();
    const canAdd = can('households', 'add');

    const [search, setSearch] = useState('');
    const [purokFilter, setPurokFilter] = useState('');
    const [sizeMin, setSizeMin] = useState('');
    const [sizeMax, setSizeMax] = useState('');
    const [hasPwd, setHasPwd] = useState(false);
    const [hasSenior, setHasSenior] = useState(false);

    const filtered = useMemo(() => {
        return households.filter((h) => {
            if (purokFilter && h.purok !== purokFilter) return false;
            if (sizeMin && h.familyMembersCount < Number(sizeMin)) return false;
            if (sizeMax && h.familyMembersCount > Number(sizeMax)) return false;
            if (hasPwd && h.pwdMembersCount <= 0) return false;
            if (hasSenior && h.seniorMembersCount <= 0) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [h.householdNo, h.headOfFamily, h.purok, h.address].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [households, search, purokFilter, sizeMin, sizeMax, hasPwd, hasSenior]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 6);

    const exportHeaders = ['HH No.', 'Purok', 'Address', 'Head of Family', 'Family Members', 'Voter Members', 'PWD Members', 'Senior Members'];
    const exportRows = useMemo(() => filtered.map((h) => [
        h.householdNo, h.purok, h.address || '', h.headOfFamily, h.familyMembersCount, h.voterMembersCount, h.pwdMembersCount, h.seniorMembersCount,
    ]), [filtered]);

    const filtersActive = !!(search || purokFilter || sizeMin || sizeMax || hasPwd || hasSenior);
    function clearFilters() {
        setSearch('');
        setPurokFilter('');
        setSizeMin('');
        setSizeMax('');
        setHasPwd(false);
        setHasSenior(false);
    }

    const purokData = useMemo(() => buildPurokDistribution(households), [households]);
    const trendData = useMemo(() => buildHouseholdTrend(households), [households]);

    if (loading) {
        return <LoadingSpinner label="Loading households…" />;
    }

    let emptyTitle = null;
    let emptyBody = null;
    if (households.length === 0) {
        emptyTitle = 'No households yet.';
        emptyBody = 'Click "Register New Household" to add your first record.';
    } else if (filtered.length === 0) {
        emptyTitle = 'No matching households.';
        emptyBody = 'Try a different search or filter.';
    }

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🏠</div>
                            <div>
                                <div className="stat-tile-label">Total Households</div>
                                <div className="fs-4 stat-tile-value">{households.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Purok Distribution</div>
                            <div className="viz-card-subtitle mb-2">Households per purok</div>
                            <HBarList data={purokData} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Monthly Household Registrations</div>
                            <div className="viz-card-subtitle mb-2">New households, last 6 months</div>
                            <ColumnChart data={trendData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Household Grid</h5>
                            <p className="text-muted small mb-0">Manage the barangay household masterlist</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Households" headers={exportHeaders} rows={exportRows} />
                            {canAdd && (
                                <button type="button" className="btn btn-accent" onClick={openAddHousehold}>
                                    + Register New Household
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search household no. or head of family..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <select className="form-select" value={purokFilter} onChange={(e) => setPurokFilter(e.target.value)}>
                                <option value="">By Purok</option>
                                {PUROKS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="row g-2 mt-0 align-items-center">
                        <div className="col-3 col-md-2">
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="Size min"
                                value={sizeMin}
                                onChange={(e) => setSizeMin(e.target.value)}
                            />
                        </div>
                        <div className="col-3 col-md-2">
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="Size max"
                                value={sizeMax}
                                onChange={(e) => setSizeMax(e.target.value)}
                            />
                        </div>
                        <div className="col-3 col-md-3 form-check d-flex align-items-center gap-2 ps-4">
                            <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                id="hasPwdFilter"
                                checked={hasPwd}
                                onChange={(e) => setHasPwd(e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="hasPwdFilter">Has PWD member</label>
                        </div>
                        <div className="col-3 col-md-3 form-check d-flex align-items-center gap-2 ps-4">
                            <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                id="hasSeniorFilter"
                                checked={hasSenior}
                                onChange={(e) => setHasSenior(e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="hasSeniorFilter">Has senior member</label>
                        </div>
                        <div className="col-12 col-md-2 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <p className="text-muted small mb-2">
                        {households.length ? `Showing ${filtered.length} of ${households.length} household${households.length === 1 ? '' : 's'}` : ''}
                    </p>

                    {emptyTitle && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🏠</p>
                            <p className="fs-5">{emptyTitle}</p>
                            <p>{emptyBody}</p>
                        </div>
                    )}

                    <div className="table-responsive">
                        <HouseholdsTable households={pageItems} />
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>
        </section>
    );
}
