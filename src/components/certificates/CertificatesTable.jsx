import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { printDocument } from '../../utils/actions.js';

function handlePrint(certificate) {
    const dateStr = formatDate(new Date(certificate.issuedAt).toISOString());
    printDocument(`${certificate.type} — ${certificate.referenceNo}`, `
        <h1>${certificate.type}</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            <tr><td class="label">Issued To</td><td class="value">${certificate.residentName}</td></tr>
            <tr><td class="label">Purpose</td><td class="value">${certificate.purpose || '—'}</td></tr>
            <tr><td class="label">Fee</td><td class="value">${formatCurrency(certificate.fee)}</td></tr>
            <tr><td class="label">Reference No.</td><td class="value">${certificate.referenceNo}</td></tr>
            <tr><td class="label">Date Issued</td><td class="value">${dateStr}</td></tr>
        </table>
        <div class="sign-line"><div class="line">Barangay Official Signature</div></div>
    `);
}

export default function CertificatesTable({ certificates }) {
    const { openViewCertificate, openDeleteCertificate } = useUI();
    const { can } = useAuth();
    const canDelete = can('certificates', 'delete');

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
                {certificates.map((c) => (
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
                                    <Dropdown.Item onClick={() => handlePrint(c)}>🖨️ Print</Dropdown.Item>
                                    {canDelete && (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger" onClick={() => openDeleteCertificate(c.id)}>🗑️ Delete</Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
