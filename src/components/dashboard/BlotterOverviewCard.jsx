import { formatDate } from '../../utils/format.js';
import StatusPill from '../common/StatusPill.jsx';

export default function BlotterOverviewCard({ blotters }) {
    const active = blotters.filter((b) => b.status === 'Active').length;
    const settled = blotters.filter((b) => b.status === 'Settled').length;
    const recent = [...blotters].sort((a, b) => b.filedAt - a.filedAt).slice(0, 6);

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
                <div className="viz-card-title mb-0">Blotter Overview</div>
                <div className="viz-card-subtitle">Recent case counts and status</div>
            </div>
            <div className="card-body">
                <div className="row g-2 mb-3">
                    <div className="col-6"><span className="status-pill status-warning">🕓 Active <strong>{active}</strong></span></div>
                    <div className="col-6"><span className="status-pill status-good">✅ Settled <strong>{settled}</strong></span></div>
                </div>
                {blotters.length === 0 ? (
                    <div className="text-center text-muted py-3">
                        <p className="mb-0">No blotter cases filed yet.</p>
                    </div>
                ) : (
                    recent.map((b) => (
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-top py-2" key={b.id}>
                            <div className="text-truncate" style={{ minWidth: 0, flex: '1 1 200px' }}>
                                <div className="fw-semibold small">{b.incidentType}</div>
                                <div className="text-muted small text-truncate">{b.complainant} vs {b.respondent} · {formatDate(b.incidentDate)}</div>
                            </div>
                            <StatusPill status={b.status} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
