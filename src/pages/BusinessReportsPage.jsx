import { useMemo } from 'react';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { businessesConfig } from '../lib/entityConfigs/businesses.js';
import { businessClearanceConfig } from '../lib/entityConfigs/businessPermits.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import { formatCurrency } from '../utils/format.js';
import { expiryStatus, isExpiringOrExpired } from '../lib/expiryStatus.js';

export default function BusinessReportsPage() {
    const { items: businesses, loading: bLoading } = useGenericEntity(businessesConfig);
    const { items: permits, loading: pLoading } = useGenericEntity(businessClearanceConfig);

    const typeBreakdown = useMemo(() => {
        const counts = {};
        businesses.forEach((b) => {
            const key = b.businessType || 'Unspecified';
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }, [businesses]);

    const statusBreakdown = useMemo(() => {
        const counts = {};
        businesses.forEach((b) => {
            const key = b.status || 'Active';
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [businesses]);

    const expiringSoon = useMemo(
        () => businesses.filter((b) => isExpiringOrExpired(b.expirationDate)),
        [businesses]
    );

    const totalPermitRevenue = useMemo(() => permits.reduce((sum, p) => sum + (Number(p.fee) || 0), 0), [permits]);

    if (bLoading || pLoading) return <LoadingSpinner label="Loading business reports…" />;

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🏪</div>
                            <div>
                                <div className="stat-tile-label">Total Businesses</div>
                                <div className="fs-4 stat-tile-value">{businesses.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">⚠️</div>
                            <div>
                                <div className="stat-tile-label">Expiring / Expired</div>
                                <div className="fs-4 stat-tile-value">{expiringSoon.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">📋</div>
                            <div>
                                <div className="stat-tile-label">Permits Issued</div>
                                <div className="fs-4 stat-tile-value">{permits.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">💰</div>
                            <div>
                                <div className="stat-tile-label">Permit Fee Revenue</div>
                                <div className="fs-4 stat-tile-value">{formatCurrency(totalPermitRevenue)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Businesses by Type</div>
                            <div className="viz-card-subtitle mb-2">All registered businesses</div>
                            <HBarList data={typeBreakdown} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Businesses by Status</div>
                            <div className="viz-card-subtitle mb-2">Current registration status</div>
                            <HBarList data={statusBreakdown} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Expiring / Expired Businesses</h5>
                    <p className="text-muted small mb-0">Businesses whose registration needs renewal soon</p>
                </div>
                <div className="card-body">
                    {expiringSoon.length === 0 && <p className="text-muted small mb-0">Nothing needs attention right now.</p>}
                    {expiringSoon.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 table-stack">
                                <thead className="table-light">
                                    <tr>
                                        <th>Business Name</th>
                                        <th>Type</th>
                                        <th>Expiration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expiringSoon.map((b) => {
                                        const s = expiryStatus(b.expirationDate);
                                        return (
                                            <tr key={b.id}>
                                                <td data-label="Business Name">{b.businessName}</td>
                                                <td data-label="Type">{b.businessType || '—'}</td>
                                                <td data-label="Expiration"><span className={`status-pill ${s.cls}`}>{s.label}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
