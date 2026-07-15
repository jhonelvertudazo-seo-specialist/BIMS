import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { printCertificateDocument } from '../../utils/actions.js';
import { moduleKeyForCertificateType } from '../../lib/certificateModules.js';

async function handlePrint(certificate, resident, showToast) {
    try {
        await printCertificateDocument(certificate, resident);
    } catch (err) {
        showToast(err.message || 'Failed to prepare certificate for printing.', true);
    }
}

export default function CertificatesTable({ certificates }) {
    const { openViewCertificate, openDeleteCertificate, showToast } = useUI();
    const { residents } = useData();
    const { can } = useAuth();

    return (
        <table className="table table-hover align-middle mb-0 table-stack">
            <thead className="table-light">
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Resident</th>
                    <th>Purpose</th>
                    <th>Fee</th>
                    <th>Reference No.</th>
                    <th className="text-end">Quick Actions</th>
                </tr>
            </thead>
            <tbody>
                {certificates.map((c) => {
                    const canDeleteRow = can(moduleKeyForCertificateType(c.type), 'delete');
                    return (
                        <tr key={c.id}>
                            <td data-label="Date">{formatDate(new Date(c.issuedAt).toISOString())}</td>
                            <td data-label="Type">{c.type}</td>
                            <td data-label="Resident">{c.residentName}</td>
                            <td data-label="Purpose">{c.purpose || '—'}</td>
                            <td data-label="Fee">{formatCurrency(c.fee)}</td>
                            <td data-label="Reference No.">{c.referenceNo}</td>
                            <td className="actions-cell text-end">
                                <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                    <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => openViewCertificate(c.id)}>👁️ View Details</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handlePrint(c, residents.find((r) => r.id === c.residentId), showToast)}>🖨️ Print</Dropdown.Item>
                                        {canDeleteRow && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Item className="text-danger" onClick={() => openDeleteCertificate(c.id)}>🗑️ Delete</Dropdown.Item>
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
