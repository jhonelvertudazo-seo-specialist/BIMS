import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { INCIDENT_TYPES } from '../../utils/constants.js';

function emptyForm() {
    return {
        complainant: '', respondent: '', incidentType: '',
        incidentDate: new Date().toISOString().slice(0, 10), details: '',
    };
}

export default function BlotterFormModal() {
    const { fileBlotter } = useData();
    const { blotterModalOpen, closeBlotterModal, showToast } = useUI();
    const [form, setForm] = useState(emptyForm);
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (blotterModalOpen) {
            setForm(emptyForm());
            setValidated(false);
        }
    }, [blotterModalOpen]);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

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
            await fileBlotter({
                complainant: form.complainant.trim(),
                respondent: form.respondent.trim(),
                incidentType: form.incidentType,
                incidentDate: form.incidentDate,
                details: form.details.trim(),
            });
            showToast('Blotter case filed.');
            setValidated(false);
            closeBlotterModal();
        } catch (err) {
            showToast(err.message || 'Failed to file blotter case.', true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={blotterModalOpen} onHide={closeBlotterModal} fullscreen="sm-down" scrollable>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>File Blotter Case</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="blotterComplainant">
                                <Form.Label>Complainant <span className="required-marker">*</span></Form.Label>
                                <Form.Control required value={form.complainant} onChange={(e) => updateField('complainant', e.target.value)} />
                                <Form.Control.Feedback type="invalid">Complainant is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="blotterRespondent">
                                <Form.Label>Respondent <span className="required-marker">*</span></Form.Label>
                                <Form.Control required value={form.respondent} onChange={(e) => updateField('respondent', e.target.value)} />
                                <Form.Control.Feedback type="invalid">Respondent is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="blotterIncidentType">
                                <Form.Label>Incident Type <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.incidentType} onChange={(e) => updateField('incidentType', e.target.value)}>
                                    <option value="">Select type</option>
                                    {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Incident type is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="blotterDate">
                                <Form.Label>Incident Date <span className="required-marker">*</span></Form.Label>
                                <Form.Control type="date" required value={form.incidentDate} onChange={(e) => updateField('incidentDate', e.target.value)} />
                                <Form.Control.Feedback type="invalid">Incident date is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-12">
                            <Form.Group controlId="blotterDetails">
                                <Form.Label>Details</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Brief narrative of the incident"
                                    value={form.details}
                                    onChange={(e) => updateField('details', e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeBlotterModal} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Filing…' : 'File Case'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
