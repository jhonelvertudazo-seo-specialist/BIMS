import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';
import { PUROKS } from '../utils/constants.js';

export default function VotersPage() {
    const { residents, loading } = useData();
    const { openViewResident, openEditResident } = useUI();
    const { can } = useAuth();
    const canEdit = can('residents', 'edit');

    const [search, setSearch] = useState('');
    const [purokFilter, setPurokFilter] = useState('');

    const voters = useMemo(() => residents.filter((r) => r.registeredVoter), [residents]);

    const filtered = useMemo(() => {
        return voters.filter((r) => {
            if (purokFilter && r.purok !== purokFilter) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [r.residentId, r.fullName, r.precinctNumber, r.district, r.pollingPlace].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [voters, search, purokFilter]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 8);

    const exportHeaders = ['Resident ID', 'Full Name', 'Purok', 'Precinct Number', 'District', 'Polling Place'];
    const exportRows = useMemo(() => filtered.map((r) => [
        r.residentId, r.fullName, r.purok, r.precinctNumber || '', r.district || '', r.pollingPlace || '',
    ]), [filtered]);

    const filtersActive = !!(search || purokFilter);
    function clearFilters() {
        setSearch('');
        setPurokFilter('');
    }

    if (loading) return <LoadingSpinner label="Loading voters…" />;

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🗳️</div>
                            <div>
                                <div className="stat-tile-label">Registered Voters</div>
                                <div className="fs-4 stat-tile-value">{voters.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Voters Information</h5>
                            <p className="text-muted small mb-0">Registered voters with precinct and polling place details</p>
                        </div>
                        <ExportButtons title="Voters" headers={exportHeaders} rows={exportRows} />
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search name, precinct, polling place..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={purokFilter} onChange={(e) => setPurokFilter(e.target.value)}>
                                <option value="">By Purok</option>
                                {PUROKS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-3 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <p className="text-muted small mb-2">Showing {filtered.length} of {voters.length} registered voters</p>

                    {filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🗳️</p>
                            <p className="fs-5">No registered voters found.</p>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>Resident ID</th>
                                        <th>Full Name</th>
                                        <th>Purok</th>
                                        <th>Precinct Number</th>
                                        <th>District</th>
                                        <th>Polling Place</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((r) => (
                                        <tr key={r.id}>
                                            <td data-label="Resident ID"><span className="fw-semibold">{r.residentId}</span></td>
                                            <td data-label="Full Name">{r.fullName}</td>
                                            <td data-label="Purok">{r.purok}</td>
                                            <td data-label="Precinct Number">{r.precinctNumber || '—'}</td>
                                            <td data-label="District">{r.district || '—'}</td>
                                            <td data-label="Polling Place">{r.pollingPlace || '—'}</td>
                                            <td className="actions-cell text-end">
                                                <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => openViewResident(r.id)}>View</button>
                                                {canEdit && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEditResident(r.id)}>Edit</button>}
                                            </td>
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
