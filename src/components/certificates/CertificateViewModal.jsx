import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate, formatCurrency } from '../../utils/format.js';
import { printCertificateDocument } from '../../utils/actions.js';

function Field({ label, value }) {
    return (
        <div className="col-6">
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value}</div>
        </div>
    );
}

async function handlePrint(certificate, resident, showToast) {
    try {
        await printCertificateDocument(certificate, resident);
    } catch (err) {
        showToast(err.message || 'Failed to prepare certificate for printing.', true);
    }
}

export default function CertificateViewModal() {
    const { certificates, residents } = useData();
    const { certificateViewId, closeViewCertificate, showToast } = useUI();
    const certificate = certificates.find((c) => c.id === certificateViewId);
    const resident = certificate ? residents.find((r) => r.id === certificate.residentId) : null;

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
                <Button variant="primary" onClick={() => handlePrint(certificate, resident, showToast)}>🖨️ Print</Button>
            </Modal.Footer>
        </Modal>
    );
}
