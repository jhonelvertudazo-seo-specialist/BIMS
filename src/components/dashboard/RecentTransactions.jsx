import { formatDate, formatCurrency } from '../../utils/format.js';
import { useUI } from '../../context/UIContext.jsx';

export default function RecentTransactions({ certificates }) {
    const { openCertificateModal } = useUI();
    const sorted = [...certificates].sort((a, b) => b.issuedAt - a.issuedAt).slice(0, 6);

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
                <div>
                    <div className="viz-card-title mb-0">Recent Transactions</div>
                    <div className="viz-card-subtitle">Latest certificates issued</div>
                </div>
                <button type="button" className="btn btn-accent btn-sm text-nowrap" onClick={openCertificateModal}>+ Create New Certificate</button>
            </div>
            <div className="card-body">
                {certificates.length === 0 && (
                    <div className="text-center text-muted py-4">
                        <p className="fs-2 mb-1">📭</p>
                        <p className="mb-0">No certificates issued yet.</p>
                    </div>
                )}
                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0 table-stack">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Resident</th>
                                <th>Fee</th>
                                <th>Reference No.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((c) => (
                                <tr key={c.id}>
                                    <td data-label="Date">{formatDate(new Date(c.issuedAt).toISOString())}</td>
                                    <td data-label="Type">{c.type}</td>
                                    <td data-label="Resident">{c.residentName}</td>
                                    <td data-label="Fee">{formatCurrency(c.fee)}</td>
                                    <td data-label="Reference No.">{c.referenceNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
