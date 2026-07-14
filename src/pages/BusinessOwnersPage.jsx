import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { businessesConfig } from '../lib/entityConfigs/businesses.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';

export default function BusinessOwnersPage() {
    const { residents, loading: residentsLoading } = useData();
    const { items: businesses, loading: businessesLoading } = useGenericEntity(businessesConfig);
    const [search, setSearch] = useState('');

    const owners = useMemo(() => {
        const grouped = new Map();
        businesses.forEach((b) => {
            if (!b.ownerResidentId) return;
            if (!grouped.has(b.ownerResidentId)) grouped.set(b.ownerResidentId, []);
            grouped.get(b.ownerResidentId).push(b);
        });
        return Array.from(grouped.entries()).map(([residentId, ownedBusinesses]) => {
            const resident = residents.find((r) => r.id === residentId);
            return {
                residentId,
                name: resident?.fullName || 'Unknown Resident',
                contact: resident?.contact || '',
                businesses: ownedBusinesses,
            };
        });
    }, [businesses, residents]);

    const filtered = useMemo(() => {
        if (!search) return owners;
        const term = search.toLowerCase();
        return owners.filter((o) => o.name.toLowerCase().includes(term) || o.businesses.some((b) => b.businessName.toLowerCase().includes(term)));
    }, [owners, search]);

    const exportHeaders = ['Owner', 'Contact', 'Businesses', 'Count'];
    const exportRows = useMemo(() => filtered.map((o) => [
        o.name, o.contact || '', o.businesses.map((b) => b.businessName).join(', '), o.businesses.length,
    ]), [filtered]);

    if (residentsLoading || businessesLoading) return <LoadingSpinner label="Loading business owners…" />;

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Business Owners</h5>
                            <p className="text-muted small mb-0">Residents who own one or more registered businesses</p>
                        </div>
                        <ExportButtons title="Business Owners" headers={exportHeaders} rows={exportRows} />
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search owner or business name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-3 d-flex justify-content-md-end">
                            <ClearFiltersButton active={!!search} onClear={() => setSearch('')} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">{filtered.length} owner{filtered.length === 1 ? '' : 's'}</p>
                    {filtered.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">🏪</p>
                            <p className="fs-5">No business owners found.</p>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>Owner</th>
                                        <th>Contact</th>
                                        <th>Businesses</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((o) => (
                                        <tr key={o.residentId}>
                                            <td data-label="Owner"><span className="fw-semibold">{o.name}</span></td>
                                            <td data-label="Contact">{o.contact || '—'}</td>
                                            <td data-label="Businesses">{o.businesses.map((b) => b.businessName).join(', ')}</td>
                                            <td data-label="Count">{o.businesses.length}</td>
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
