import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { printDocument } from '../../utils/actions.js';

function Field({ label, value }) {
    return (
        <div className="col-6">
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value}</div>
        </div>
    );
}

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

export default function CertificateViewModal() {
    const { certificates } = useData();
    const { certificateViewId, closeViewCertificate } = useUI();
    const certificate = certificates.find((c) => c.id === certificateViewId);

    return (
        <Modal show={!!certificate} onHide={closeViewCertificate}>
            <Modal.Header closeButton>
                <Modal.Title>Certificate Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {certificate && (
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="text-muted small">Certificate Type</div>
                            <div className="fs-5 fw-semibold">{certificate.type}</div>
                        </div>
                        <Field label="Resident" value={certificate.residentName} />
                        <Field label="Reference No." value={certificate.referenceNo} />
                        <Field label="Fee" value={formatCurrency(certificate.fee)} />
                        <Field label="Date Issued" value={formatDate(new Date(certificate.issuedAt).toISOString())} />
                        <Field label="Purpose" value={certificate.purpose || '—'} />
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeViewCertificate}>Close</Button>
                <Button variant="primary" onClick={() => handlePrint(certificate)}>🖨️ Print</Button>
            </Modal.Footer>
        </Modal>
    );
}
