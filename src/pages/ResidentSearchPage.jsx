import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import ResidentsTable from '../components/residents/ResidentsTable.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';
import { usePagination } from '../hooks/usePagination.js';

const EMPTY_CRITERIA = {
    residentId: '', name: '', contact: '', philsysNo: '', philhealthNo: '', sssNo: '', pagibigNo: '', tin: '', address: '',
};

export default function ResidentSearchPage() {
    const { residents, loading } = useData();
    const [criteria, setCriteria] = useState(EMPTY_CRITERIA);
    const [searched, setSearched] = useState(false);

    function updateField(key, value) {
        setCriteria((prev) => ({ ...prev, [key]: value }));
    }

    const anyCriteria = Object.values(criteria).some((v) => v.trim());

    const filtered = useMemo(() => {
        if (!anyCriteria) return [];
        return residents.filter((r) => {
            if (criteria.residentId && !r.residentId?.toLowerCase().includes(criteria.residentId.toLowerCase())) return false;
            if (criteria.name && !r.fullName?.toLowerCase().includes(criteria.name.toLowerCase())) return false;
            if (criteria.contact && !r.contact?.toLowerCase().includes(criteria.contact.toLowerCase())) return false;
            if (criteria.philsysNo && !r.philsysNo?.toLowerCase().includes(criteria.philsysNo.toLowerCase())) return false;
            if (criteria.philhealthNo && !r.philhealthNo?.toLowerCase().includes(criteria.philhealthNo.toLowerCase())) return false;
            if (criteria.sssNo && !r.sssNo?.toLowerCase().includes(criteria.sssNo.toLowerCase())) return false;
            if (criteria.pagibigNo && !r.pagibigNo?.toLowerCase().includes(criteria.pagibigNo.toLowerCase())) return false;
            if (criteria.tin && !r.tin?.toLowerCase().includes(criteria.tin.toLowerCase())) return false;
            if (criteria.address) {
                const hay = [r.address, r.purok, r.sitio].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(criteria.address.toLowerCase())) return false;
            }
            return true;
        });
    }, [residents, criteria, anyCriteria]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 8);

    const exportHeaders = ['Resident ID', 'Full Name', 'Gender', 'Purok', 'Contact', 'Address'];
    const exportRows = useMemo(() => filtered.map((r) => [
        r.residentId, r.fullName, r.gender, r.purok, r.contact || '', r.address || '',
    ]), [filtered]);

    function handleSearch(event) {
        event.preventDefault();
        setSearched(true);
    }

    function clearFilters() {
        setCriteria(EMPTY_CRITERIA);
        setSearched(false);
    }

    if (loading) return <LoadingSpinner label="Loading residents…" />;

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Advanced Resident Search</h5>
                            <p className="text-muted small mb-0">Search residents across ID, name, contact, and government ID numbers</p>
                        </div>
                        <ExportButtons title="Resident Search Results" headers={exportHeaders} rows={exportRows} />
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className="row g-2">
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="Resident ID" value={criteria.residentId} onChange={(e) => updateField('residentId', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="Full Name" value={criteria.name} onChange={(e) => updateField('name', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="Contact Number" value={criteria.contact} onChange={(e) => updateField('contact', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="Address / Purok / Sitio" value={criteria.address} onChange={(e) => updateField('address', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="PhilSys No." value={criteria.philsysNo} onChange={(e) => updateField('philsysNo', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="PhilHealth No." value={criteria.philhealthNo} onChange={(e) => updateField('philhealthNo', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="SSS No." value={criteria.sssNo} onChange={(e) => updateField('sssNo', e.target.value)} />
                            </div>
                            <div className="col-6 col-md-3">
                                <input className="form-control" placeholder="TIN" value={criteria.tin} onChange={(e) => updateField('tin', e.target.value)} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <ClearFiltersButton active={anyCriteria} onClear={clearFilters} />
                            <button type="submit" className="btn btn-accent">🔍 Search</button>
                        </div>
                    </form>
                </div>

                <div className="card-body">
                    {!searched && !anyCriteria && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🔎</p>
                            <p className="fs-5">Enter search criteria above to find residents.</p>
                        </div>
                    )}

                    {(searched || anyCriteria) && (
                        <>
                            <p className="text-muted small mb-2">
                                {anyCriteria ? `Found ${filtered.length} matching resident${filtered.length === 1 ? '' : 's'}` : ''}
                            </p>
                            {anyCriteria && filtered.length === 0 && (
                                <div className="text-center text-muted py-5">
                                    <p className="fs-1 mb-2">🗂️</p>
                                    <p className="fs-5">No matching residents.</p>
                                </div>
                            )}
                            {filtered.length > 0 && (
                                <div className="table-responsive">
                                    <ResidentsTable residents={pageItems} />
                                </div>
                            )}
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
