import { Link } from 'react-router-dom';
import { useSystemAlerts } from '../../hooks/useSystemAlerts.js';

function AlertRow({ icon, label, count, to }) {
    if (!count) return null;
    return (
        <Link to={to} className="d-flex align-items-center justify-content-between text-decoration-none py-2 border-bottom system-alert-row">
            <span className="d-flex align-items-center gap-2 text-body">
                <span>{icon}</span>
                <span>{label}</span>
            </span>
            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill">{count}</span>
        </Link>
    );
}

export default function SystemAlertsCard() {
    const { alerts, loading } = useSystemAlerts();

    const rows = [
        { icon: '🆕', label: 'Accounts awaiting approval', count: alerts.pendingApprovals, to: '/users' },
        { icon: '📋', label: 'Business permits expiring/expired', count: alerts.expiringPermits, to: '/permit-renewal' },
        { icon: '♿', label: 'PWD IDs expiring/expired', count: alerts.expiringPwdIds, to: '/pwd' },
        { icon: '🧑‍🍼', label: 'Solo Parent IDs expiring/expired', count: alerts.expiringSoloParentIds, to: '/solo-parents' },
        { icon: '🧓', label: 'Residents 60+ not yet registered as Senior Citizens', count: alerts.seniorCandidates, to: '/senior-citizens' },
        { icon: '🎓', label: 'Residents 15-30 not yet in the Youth Profile', count: alerts.youthCandidates, to: '/youth' },
    ];

    const visibleRows = rows.filter((r) => r.count > 0);

    if (loading) return null;
    if (visibleRows.length === 0) return null;

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <div className="viz-card-title">Needs Attention</div>
                <div className="viz-card-subtitle mb-2">Follow-ups the system found automatically</div>
                {visibleRows.map((r) => (
                    <AlertRow key={r.label} icon={r.icon} label={r.label} count={r.count} to={r.to} />
                ))}
            </div>
        </div>
    );
}
