import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CERTIFICATE_TYPES } from '../../utils/constants.js';
import { moduleKeyForCertificateType } from '../../lib/certificateModules.js';

const EMPTY_FORM = { residentId: '', type: '', purpose: '', fee: '' };

export default function CertificateFormModal() {
    const { residents, issueCertificate } = useData();
    const { certificateModalOpen, certificateModalInitialType, closeCertificateModal, showToast } = useUI();
    const { can } = useAuth();
    const [form, setForm] = useState(EMPTY_FORM);
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (certificateModalOpen) {
            setForm({ ...EMPTY_FORM, type: certificateModalInitialType || '' });
            setValidated(false);
        }
    }, [certificateModalOpen, certificateModalInitialType]);

    const sortedResidents = useMemo(
        () => [...residents].sort((a, b) => a.fullName.localeCompare(b.fullName)),
        [residents]
    );

    // Defense-in-depth: even if this modal were ever opened without a
    // pre-selected type (e.g. a future "Issue Certificate" quick action
    // that doesn't specify one), only offer types this user is actually
    // permitted to issue.
    const selectableTypes = useMemo(
        () => CERTIFICATE_TYPES.filter((t) => can(moduleKeyForCertificateType(t), 'add')),
        [can]
    );

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
            await issueCertificate({
                residentId: form.residentId,
                type: form.type,
                fee: Number(form.fee) || 0,
                purpose: form.purpose.trim(),
            });
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
                        {certificateModalInitialType ? (
                            <>
                                <Form.Control type="text" readOnly value={form.type} />
                                <Form.Text className="text-muted">Set by the tab you issued this from.</Form.Text>
                            </>
                        ) : (
                            <>
                                <Form.Select required value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                                    <option value="">Select type</option>
                                    {selectableTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please select a certificate type.</Form.Control.Feedback>
                            </>
                        )}
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

                    <Form.Group controlId="certificateFee">
                        <Form.Label>Fee <span className="required-marker">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="Enter the amount to charge for this certificate"
                            value={form.fee}
                            onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                        />
                        <Form.Control.Feedback type="invalid">Please enter the fee for this certificate.</Form.Control.Feedback>
                        <Form.Text className="text-muted">No default amount — set the fee for this specific certificate.</Form.Text>
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
