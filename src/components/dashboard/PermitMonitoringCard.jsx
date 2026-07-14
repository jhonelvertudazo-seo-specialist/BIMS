import { formatDate } from '../../utils/format.js';

export default function PermitMonitoringCard({ certificates }) {
    const permits = certificates
        .filter((c) => c.type === 'Business Permit Endorsement')
        .sort((a, b) => b.issuedAt - a.issuedAt)
        .slice(0, 6);

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
                <div className="viz-card-title mb-0">Business Permit Endorsements</div>
                <div className="viz-card-subtitle">Recently issued to residents</div>
            </div>
            <div className="card-body">
                {permits.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <p className="fs-2 mb-1">📋</p>
                        <p className="mb-0">No business permit endorsements issued yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0 table-stack">
                            <thead className="table-light">
                                <tr>
                                    <th>Resident</th>
                                    <th>Date</th>
                                    <th>Reference No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permits.map((p) => (
                                    <tr key={p.id}>
                                        <td data-label="Resident">{p.residentName}</td>
                                        <td data-label="Date">{formatDate(new Date(p.issuedAt).toISOString())}</td>
                                        <td data-label="Reference No.">{p.referenceNo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
