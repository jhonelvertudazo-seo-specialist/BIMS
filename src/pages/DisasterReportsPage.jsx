import { useMemo } from 'react';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { disasterIncidentsConfig, evacuationCentersConfig, reliefDistributionsConfig } from '../lib/entityConfigs/disaster.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import HBarList from '../components/charts/HBarList.jsx';

export default function DisasterReportsPage() {
    const { items: incidents, loading: iLoading } = useGenericEntity(disasterIncidentsConfig);
    const { items: centers, loading: cLoading } = useGenericEntity(evacuationCentersConfig);
    const { items: relief, loading: rLoading } = useGenericEntity(reliefDistributionsConfig);

    const typeBreakdown = useMemo(() => {
        const counts = {};
        incidents.forEach((i) => {
            const key = i.disasterType || 'Other';
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }, [incidents]);

    const totalFamilies = useMemo(() => incidents.reduce((s, i) => s + (Number(i.familiesAffected) || 0), 0), [incidents]);
    const totalResidents = useMemo(() => incidents.reduce((s, i) => s + (Number(i.residentsAffected) || 0), 0), [incidents]);
    const totalCasualties = useMemo(() => incidents.reduce((s, i) => s + (Number(i.casualties) || 0), 0), [incidents]);
    const availableCenters = useMemo(() => centers.filter((c) => c.status === 'Available').length, [centers]);

    if (iLoading || cLoading || rLoading) return <LoadingSpinner label="Loading disaster reports…" />;

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🚨</div>
                            <div>
                                <div className="stat-tile-label">Total Incidents</div>
                                <div className="fs-4 stat-tile-value">{incidents.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">👪</div>
                            <div>
                                <div className="stat-tile-label">Families Affected</div>
                                <div className="fs-4 stat-tile-value">{totalFamilies}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">⚠️</div>
                            <div>
                                <div className="stat-tile-label">Casualties</div>
                                <div className="fs-4 stat-tile-value">{totalCasualties}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">⛺</div>
                            <div>
                                <div className="stat-tile-label">Centers Available</div>
                                <div className="fs-4 stat-tile-value">{availableCenters} / {centers.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Incidents by Type</div>
                            <div className="viz-card-subtitle mb-2">All logged disaster incidents</div>
                            <HBarList data={typeBreakdown} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Relief Distribution</div>
                            <div className="viz-card-subtitle mb-2">Total relief records</div>
                            <p className="fs-3 fw-semibold mb-0">{relief.length}</p>
                            <p className="text-muted small mb-0">households served across all incidents</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
