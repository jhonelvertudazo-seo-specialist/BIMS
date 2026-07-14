import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { businessesConfig } from '../lib/entityConfigs/businesses.js';
import { collectionsConfig } from '../lib/entityConfigs/collections.js';
import { eventsConfig, appointmentsConfig } from '../lib/entityConfigs/scheduling.js';
import StatTile from '../components/common/StatTile.jsx';
import GenderDistributionChart from '../components/charts/GenderDistributionChart.jsx';
import ColumnChart from '../components/charts/ColumnChart.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import LineChart from '../components/charts/LineChart.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';
import BlotterOverviewCard from '../components/dashboard/BlotterOverviewCard.jsx';
import PermitMonitoringCard from '../components/dashboard/PermitMonitoringCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { calculateAge, formatCurrency, nameFromEmail } from '../utils/format.js';
import { buildLast6MonthsTrend, buildRevenueTrend, buildZoneDensity } from '../utils/dashboardStats.js';

export default function DashboardPage() {
    const { residents, certificates, blotters, loading } = useData();
    const { openAddResident, openCertificateModal, openBlotterModal } = useUI();
    const { user } = useAuth();
    const firstName = nameFromEmail(user?.email).split(' ')[0];

    const { items: businesses, loading: businessesLoading } = useGenericEntity(businessesConfig);
    const { items: collections, loading: collectionsLoading } = useGenericEntity(collectionsConfig);
    const { items: events, loading: eventsLoading } = useGenericEntity(eventsConfig);
    const { items: appointments, loading: appointmentsLoading } = useGenericEntity(appointmentsConfig);

    const trendData = useMemo(() => buildLast6MonthsTrend(residents), [residents]);
    const revenueData = useMemo(() => buildRevenueTrend(certificates), [certificates]);
    const zoneData = useMemo(() => buildZoneDensity(residents), [residents]);

    if (loading || businessesLoading || collectionsLoading || eventsLoading || appointmentsLoading) {
        return <LoadingSpinner label="Loading dashboard…" />;
    }

    const totalResidents = residents.length;
    const registeredVoters = residents.filter((r) => r.registeredVoter).length;
    const seniors = residents.filter((r) => r.sector === 'Senior Citizen' || (calculateAge(r.birthDate) ?? 0) >= 60).length;
    const pwds = residents.filter((r) => r.sector === 'PWD').length;
    const soloParents = residents.filter((r) => r.sector === 'Solo Parent').length;
    const ofws = residents.filter((r) => r.sector === 'OFW').length;

    const activeBlotterCases = blotters.filter((b) => b.status === 'Active').length;
    const settledBlotterCases = blotters.filter((b) => b.status === 'Settled').length;
    const certFeeRevenue = certificates.reduce((s, c) => s + (Number(c.fee) || 0), 0);
    const collectionRevenue = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);
    const totalRevenue = certFeeRevenue + collectionRevenue;
    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    const upcomingEvents = events.filter((e) => e.date >= today && e.date <= sevenDaysOut).length
        + appointments.filter((a) => a.date >= today && a.date <= sevenDaysOut).length;

    const dashboardDate = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <section className="app-view">
            <div className="mb-4">
                <h4 className="mb-1">Welcome back, {firstName} 👋</h4>
                <p className="text-muted mb-0">{dashboardDate}</p>
            </div>

            <h6 className="text-uppercase text-muted small fw-bold mb-2">Population Profile</h6>
            <div className="row g-3 mb-4">
                <div className="col-6 col-xl-2">
                    <StatTile icon="👪" iconBg="bg-primary-subtle text-primary" label="Total Residents" value={totalResidents} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="🗳️" iconBg="bg-info-subtle text-info" label="Registered Voters" value={registeredVoters} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="🧓" iconBg="bg-warning-subtle text-warning" label="Senior Citizens" value={seniors} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="♿" iconBg="bg-secondary-subtle text-secondary" label="PWDs" value={pwds} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="🧑‍🍼" iconBg="bg-success-subtle text-success" label="Solo Parents" value={soloParents} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="✈️" iconBg="bg-primary-subtle text-primary" label="OFWs" value={ofws} />
                </div>
            </div>

            <h6 className="text-uppercase text-muted small fw-bold mb-2">Barangay Operations</h6>
            <div className="row g-3 mb-4">
                <div className="col-6 col-xl-2">
                    <StatTile icon="🏪" iconBg="bg-primary-subtle text-primary" label="Registered Businesses" value={businesses.length} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="🕓" iconBg="bg-warning-subtle text-warning" label="Active Blotter Cases" value={activeBlotterCases} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="✅" iconBg="bg-success-subtle text-success" label="Settled Cases" value={settledBlotterCases} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="💰" iconBg="bg-success-subtle text-success" label="Monthly Revenue" value={formatCurrency(totalRevenue)} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="📄" iconBg="bg-info-subtle text-info" label="Certificates Issued" value={certificates.length} />
                </div>
                <div className="col-6 col-xl-2">
                    <StatTile icon="🗓️" iconBg="bg-primary-subtle text-primary" label="Upcoming (7 days)" value={upcomingEvents} />
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Gender Distribution</div>
                            <div className="viz-card-subtitle mb-2">Share of registered residents by gender</div>
                            <GenderDistributionChart residents={residents} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-7">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Resident Registration Trend</div>
                            <div className="viz-card-subtitle mb-2">New residents registered in the last 6 months</div>
                            <ColumnChart data={trendData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-2 mb-4">
                <div className="col-4">
                    <button type="button" className="quick-action-btn w-100" onClick={openAddResident}>
                        <span className="qa-icon">👤</span> New Resident
                    </button>
                </div>
                <div className="col-4">
                    <button type="button" className="quick-action-btn w-100" onClick={openCertificateModal}>
                        <span className="qa-icon">📄</span> Issue Certificate
                    </button>
                </div>
                <div className="col-4">
                    <button type="button" className="quick-action-btn w-100" onClick={openBlotterModal}>
                        <span className="qa-icon">📁</span> File Blotter
                    </button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-7">
                    <RecentTransactions certificates={certificates} />
                </div>
                <div className="col-12 col-lg-5">
                    <BlotterOverviewCard blotters={blotters} />
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-6">
                    <PermitMonitoringCard certificates={certificates} />
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Revenue Summary</div>
                            <div className="viz-card-subtitle mb-2">Certificate fees collected, last 6 months</div>
                            <LineChart data={revenueData} formatValue={formatCurrency} ariaLabel="Revenue summary line chart" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-2">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="viz-card-title">Residents by Purok</div>
                            <div className="viz-card-subtitle mb-2">Population density across puroks</div>
                            <HBarList data={zoneData} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
