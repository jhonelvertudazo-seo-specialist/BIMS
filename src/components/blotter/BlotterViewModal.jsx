import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate } from '../../utils/format.js';
import { printDocument } from '../../utils/actions.js';
import StatusPill from '../common/StatusPill.jsx';

function Field({ label, value }) {
    return (
        <div className="col-6">
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value}</div>
        </div>
    );
}

function handlePrint(blotter) {
    printDocument(`Blotter Report — ${blotter.caseNo}`, `
        <h1>Blotter Report</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            <tr><td class="label">Case No.</td><td class="value">${blotter.caseNo}</td></tr>
            <tr><td class="label">Incident Date</td><td class="value">${formatDate(blotter.incidentDate)}</td></tr>
            <tr><td class="label">Complainant</td><td class="value">${blotter.complainant}</td></tr>
            <tr><td class="label">Respondent</td><td class="value">${blotter.respondent}</td></tr>
            <tr><td class="label">Incident Type</td><td class="value">${blotter.incidentType}</td></tr>
            <tr><td class="label">Status</td><td class="value">${blotter.status}</td></tr>
            <tr><td class="label">Details</td><td class="value">${blotter.details || '—'}</td></tr>
        </table>
        <div class="sign-line"><div class="line">Barangay Official Signature</div></div>
    `);
}

export default function BlotterViewModal() {
    const { blotters } = useData();
    const { blotterViewId, closeViewBlotter } = useUI();
    const blotter = blotters.find((b) => b.id === blotterViewId);

    return (
        <Modal show={!!blotter} onHide={closeViewBlotter}>
            <Modal.Header closeButton>
                <Modal.Title>Blotter Case Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {blotter && (
                    <div className="row g-3">
                        <div className="col-12 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small">Case No.</div>
                                <div className="fs-5 fw-semibold">{blotter.caseNo}</div>
                            </div>
                            <StatusPill status={blotter.status} />
                        </div>
                        <Field label="Incident Date" value={formatDate(blotter.incidentDate)} />
                        <Field label="Incident Type" value={blotter.incidentType} />
                        <Field label="Complainant" value={blotter.complainant} />
                        <Field label="Respondent" value={blotter.respondent} />
                        <div className="col-12">
                            <div className="text-muted small">Details</div>
                            <div className="fw-medium">{blotter.details || '—'}</div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeViewBlotter}>Close</Button>
                <Button variant="primary" onClick={() => handlePrint(blotter)}>🖨️ Print</Button>
            </Modal.Footer>
        </Modal>
    );
}
