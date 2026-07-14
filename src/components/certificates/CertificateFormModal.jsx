import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { CERTIFICATE_TYPES } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/format.js';

const EMPTY_FORM = { residentId: '', type: '', purpose: '' };

export default function CertificateFormModal() {
    const { residents, issueCertificate } = useData();
    const { certificateModalOpen, closeCertificateModal, showToast } = useUI();
    const [form, setForm] = useState(EMPTY_FORM);
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (certificateModalOpen) {
            setForm(EMPTY_FORM);
            setValidated(false);
        }
    }, [certificateModalOpen]);

    const sortedResidents = useMemo(
        () => [...residents].sort((a, b) => a.fullName.localeCompare(b.fullName)),
        [residents]
    );
    const selectedType = CERTIFICATE_TYPES.find((t) => t.type === form.type);
    const fee = selectedType ? selectedType.fee : 0;

    async function handleSubmit(event) {
        const formEl = event.currentTarget;
        event.preventDefault();

        if (!formEl.checkValidity()) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setSubmitting(true);
        try {
            await issueCertificate({ residentId: form.residentId, type: form.type, fee, purpose: form.purpose.trim() });
            showToast('Certificate issued.');
            setValidated(false);
            closeCertificateModal();
        } catch (err) {
            showToast(err.message || 'Failed to issue certificate.', true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={certificateModalOpen} onHide={closeCertificateModal} fullscreen="sm-down" scrollable>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Issue Certificate</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="certificateResident">
                        <Form.Label>Resident <span className="required-marker">*</span></Form.Label>
                        <Form.Select required value={form.residentId} onChange={(e) => setForm((p) => ({ ...p, residentId: e.target.value }))}>
                            <option value="">Select resident</option>
                            {sortedResidents.map((r) => (
                                <option key={r.id} value={r.id}>{r.residentId} — {r.fullName}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select a resident.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="certificateType">
                        <Form.Label>Certificate Type <span className="required-marker">*</span></Form.Label>
                        <Form.Select required value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                            <option value="">Select type</option>
                            {CERTIFICATE_TYPES.map((t) => (
                                <option key={t.type} value={t.type}>{t.type} — {formatCurrency(t.fee)}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">Please select a certificate type.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="certificatePurpose">
                        <Form.Label>Purpose</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Employment requirement"
                            value={form.purpose}
                            onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                        />
                    </Form.Group>

                    <Form.Group controlId="certificateFeeDisplay">
                        <Form.Label>Fee</Form.Label>
                        <Form.Control type="text" readOnly value={formatCurrency(fee)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeCertificateModal} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Issuing…' : 'Issue Certificate'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
