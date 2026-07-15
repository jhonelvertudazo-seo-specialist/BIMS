import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import { useData } from '../context/DataContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import GenderDistributionChart from '../components/charts/GenderDistributionChart.jsx';
import { buildPurokDistribution } from '../utils/dashboardStats.js';
import { calculateAge } from '../utils/format.js';
import { downloadCsv } from '../utils/actions.js';
import { CIVIL_STATUSES } from '../utils/constants.js';

const AGE_BRACKETS = [
    { label: '0-12', min: 0, max: 12 },
    { label: '13-17', min: 13, max: 17 },
    { label: '18-30', min: 18, max: 30 },
    { label: '31-50', min: 31, max: 50 },
    { label: '51-64', min: 51, max: 64 },
    { label: '65+', min: 65, max: 200 },
];

const CUSTOM_MODULES = [
    { key: 'residents', label: 'Residents', fields: ['residentId', 'fullName', 'gender', 'purok', 'sector', 'contact'] },
    { key: 'households', label: 'Households', fields: ['householdNo', 'purok', 'headOfFamily', 'familyMembersCount'] },
    { key: 'certificates', label: 'Certificates', fields: ['referenceNo', 'type', 'residentName', 'fee'] },
    { key: 'blotters', label: 'Blotter Cases', fields: ['caseNo', 'complainant', 'respondent', 'status'] },
];

export default function ReportsPage() {
    const { residents, households, certificates, blotters, loading } = useData();
    const [customModule, setCustomModule] = useState('residents');

    const ageBreakdown = useMemo(() => {
        return AGE_BRACKETS.map((bracket) => ({
            label: bracket.label,
            value: residents.filter((r) => {
                const age = calculateAge(r.birthDate);
                return age != null && age >= bracket.min && age <= bracket.max;
            }).length,
        }));
    }, [residents]);

    const civilStatusBreakdown = useMemo(() => {
        return CIVIL_STATUSES.map((status) => ({
            label: status,
            value: residents.filter((r) => r.civilStatus === status).length,
        }));
    }, [residents]);

    const purokDistribution = useMemo(() => buildPurokDistribution(residents), [residents]);
    const householdPurokDistribution = useMemo(() => buildPurokDistribution(households), [households]);

    const householdSizeBreakdown = useMemo(() => {
        const buckets = [
            { label: '1-2', min: 1, max: 2 },
            { label: '3-5', min: 3, max: 5 },
            { label: '6-8', min: 6, max: 8 },
            { label: '9+', min: 9, max: 999 },
        ];
        return buckets.map((b) => ({
            label: b.label,
            value: households.filter((h) => h.familyMembersCount >= b.min && h.familyMembersCount <= b.max).length,
        }));
    }, [households]);

    const blotterStatusBreakdown = useMemo(() => {
        const counts = {};
        blotters.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [blotters]);

    const blotterTypeBreakdown = useMemo(() => {
        const counts = {};
        blotters.forEach((b) => { counts[b.incidentType] = (counts[b.incidentType] || 0) + 1; });
        return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }, [blotters]);

    function exportCustom() {
        const moduleData = { residents, households, certificates, blotters }[customModule];
        const meta = CUSTOM_MODULES.find((m) => m.key === customModule);
        const rows = moduleData.map((item) => meta.fields.map((f) => item[f] ?? ''));
        downloadCsv(`${customModule}-report.csv`, meta.fields, rows);
    }

    if (loading) return <LoadingSpinner label="Loading reports…" />;

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Reports & Analytics</h5>
                    <p className="text-muted small mb-0">Cross-module reporting and data export</p>
                </div>
                <div className="card-body">
                    <Tabs defaultActiveKey="population" className="mb-3 scroll-tabs">
                        <Tab eventKey="population" title="Population">
                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Gender Breakdown</div>
                                            <GenderDistributionChart residents={residents} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Age Group</div>
                                            <HBarList data={ageBreakdown} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Civil Status</div>
                                            <HBarList data={civilStatusBreakdown} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Population by Purok</div>
                                            <HBarList data={purokDistribution} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey="household" title="Household">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Households by Purok</div>
                                            <HBarList data={householdPurokDistribution} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Household Size Distribution</div>
                                            <HBarList data={householdSizeBreakdown} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey="blotter" title="Blotter">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Cases by Status</div>
                                            <HBarList data={blotterStatusBreakdown} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <div className="viz-card-title">Cases by Incident Type</div>
                                            <HBarList data={blotterTypeBreakdown} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey="financial" title="Financial">
                            <p className="text-muted small">Full revenue, expense, and budget breakdowns live on the dedicated Financial Reports page.</p>
                            <Link to="/financial-reports" className="btn btn-accent btn-sm">Open Financial Reports →</Link>
                        </Tab>

                        <Tab eventKey="business" title="Business">
                            <p className="text-muted small">Business type, status, and expiring-permit breakdowns live on the dedicated Business Reports page.</p>
                            <Link to="/business-reports" className="btn btn-accent btn-sm">Open Business Reports →</Link>
                        </Tab>

                        <Tab eventKey="custom" title="Custom">
                            <p className="text-muted small">Export raw module data to CSV.</p>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <select className="form-select" style={{ maxWidth: 260, flex: '1 1 200px' }} value={customModule} onChange={(e) => setCustomModule(e.target.value)}>
                                    {CUSTOM_MODULES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                                </select>
                                <button type="button" className="btn btn-accent" onClick={exportCustom}>⬇ Export CSV</button>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </section>
    );
}
