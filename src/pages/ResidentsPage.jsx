import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ResidentsTable from '../components/residents/ResidentsTable.jsx';
import GenderDistributionChart from '../components/charts/GenderDistributionChart.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';
import { calculateAge, formatDate } from '../utils/format.js';
import { PUROKS, SECTORS, CIVIL_STATUSES, EMPLOYMENT_STATUSES } from '../utils/constants.js';

export default function ResidentsPage() {
    const { residents, loading } = useData();
    const { openAddResident } = useUI();
    const { can } = useAuth();
    const canAdd = can('residents', 'add');

    const [search, setSearch] = useState('');
    const [purokFilter, setPurokFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');
    const [voterFilter, setVoterFilter] = useState('');
    const [civilStatusFilter, setCivilStatusFilter] = useState('');
    const [employmentFilter, setEmploymentFilter] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');

    const filtered = useMemo(() => {
        return residents.filter((r) => {
            if (purokFilter && r.purok !== purokFilter) return false;
            if (sectorFilter && r.sector !== sectorFilter) return false;
            if (voterFilter === 'registered' && !r.registeredVoter) return false;
            if (voterFilter === 'unregistered' && r.registeredVoter) return false;
            if (civilStatusFilter && r.civilStatus !== civilStatusFilter) return false;
            if (employmentFilter && r.employmentStatus !== employmentFilter) return false;
            if (ageMin || ageMax) {
                const age = calculateAge(r.birthDate);
                if (age == null) return false;
                if (ageMin && age < Number(ageMin)) return false;
                if (ageMax && age > Number(ageMax)) return false;
            }
            if (search) {
                const term = search.toLowerCase();
                const hay = [r.residentId, r.fullName, r.purok, r.occupation, r.sector].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [residents, search, purokFilter, sectorFilter, voterFilter, civilStatusFilter, employmentFilter, ageMin, ageMax]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 6);

    const exportHeaders = ['Resident ID', 'Full Name', 'Gender', 'Birth Date', 'Purok', 'Civil Status', 'Sector', 'Occupation', 'Employment Status', 'Contact', 'Registered Voter'];
    const exportRows = useMemo(() => filtered.map((r) => [
        r.residentId, r.fullName, r.gender, r.birthDate ? formatDate(r.birthDate) : '', r.purok, r.civilStatus,
        r.sector, r.occupation || '', r.employmentStatus || '', r.contact || '', r.registeredVoter ? 'Yes' : 'No',
    ]), [filtered]);

    const filtersActive = !!(search || purokFilter || sectorFilter || voterFilter || civilStatusFilter || employmentFilter || ageMin || ageMax);
    function clearFilters() {
        setSearch('');
        setPurokFilter('');
        setSectorFilter('');
        setVoterFilter('');
        setCivilStatusFilter('');
        setEmploymentFilter('');
        setAgeMin('');
        setAgeMax('');
    }

    if (loading) {
        return <LoadingSpinner label="Loading residents…" />;
    }

    const registeredVoters = residents.filter((r) => r.registeredVoter).length;

    let emptyTitle = null;
    let emptyBody = null;
    if (residents.length === 0) {
        emptyTitle = 'No residents yet.';
        emptyBody = 'Click "Register New Resident" to add your first record.';
    } else if (filtered.length === 0) {
        emptyTitle = 'No matching residents.';
        emptyBody = 'Try a different search or filter.';
    }

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">👪</div>
                            <div>
                                <div className="stat-tile-label">Total Residents</div>
                                <div className="fs-4 stat-tile-value">{residents.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Gender Breakdown</div>
                            <div className="viz-card-subtitle mb-2">All registered residents</div>
                            <GenderDistributionChart residents={residents} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Voter Registration Status</div>
                            <div className="viz-card-subtitle mb-2">All registered residents</div>
                            <HBarList data={[
                                { label: 'Registered', value: registeredVoters },
                                { label: 'Not Registered', value: residents.length - registeredVoters },
                            ]} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Resident Profile Grid</h5>
                            <p className="text-muted small mb-0">Manage the barangay resident masterlist</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Residents" headers={exportHeaders} rows={exportRows} />
                            {canAdd && (
                                <button type="button" className="btn btn-accent" onClick={openAddResident}>
                                    + Register New Resident
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search residents..."
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
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                                <option value="">By Sector</option>
                                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select" value={voterFilter} onChange={(e) => setVoterFilter(e.target.value)}>
                                <option value="">Status: All</option>
                                <option value="registered">Registered Voter</option>
                                <option value="unregistered">Not Registered</option>
                            </select>
                        </div>
                    </div>
                    <div className="row g-2 mt-0 align-items-center">
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={civilStatusFilter} onChange={(e) => setCivilStatusFilter(e.target.value)}>
                                <option value="">Civil Status: All</option>
                                {CIVIL_STATUSES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={employmentFilter} onChange={(e) => setEmploymentFilter(e.target.value)}>
                                <option value="">Employment: All</option>
                                {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-3 col-md-2">
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="Age min"
                                value={ageMin}
                                onChange={(e) => setAgeMin(e.target.value)}
                            />
                        </div>
                        <div className="col-3 col-md-2">
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                placeholder="Age max"
                                value={ageMax}
                                onChange={(e) => setAgeMax(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-2 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <p className="text-muted small mb-2">
                        {residents.length ? `Showing ${filtered.length} of ${residents.length} resident${residents.length === 1 ? '' : 's'}` : ''}
                    </p>

                    {emptyTitle && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🗂️</p>
                            <p className="fs-5">{emptyTitle}</p>
                            <p>{emptyBody}</p>
                        </div>
                    )}

                    <div className="table-responsive">
                        <ResidentsTable residents={pageItems} />
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>
        </section>
    );
}
