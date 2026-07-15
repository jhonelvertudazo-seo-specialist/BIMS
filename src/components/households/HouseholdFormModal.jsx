import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { PUROKS } from '../../utils/constants.js';

const EMPTY_FORM = {
    purok: '', address: '', headOfFamily: '',
};

export default function HouseholdFormModal() {
    const { households, addHousehold, updateHousehold } = useData();
    const { householdModal, closeHouseholdModal, showToast } = useUI();
    const [form, setForm] = useState(EMPTY_FORM);
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const editingHousehold = householdModal.id ? households.find((h) => h.id === householdModal.id) : null;

    useEffect(() => {
        if (!householdModal.open) return;
        setValidated(false);
        if (editingHousehold) {
            setForm({
                purok: editingHousehold.purok,
                address: editingHousehold.address || '',
                headOfFamily: editingHousehold.headOfFamily,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [householdModal.open, householdModal.id]);

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

        const data = {
            ...form,
            address: form.address.trim(),
            headOfFamily: form.headOfFamily.trim(),
        };

        setSubmitting(true);
        try {
            if (editingHousehold) {
                await updateHousehold(editingHousehold.id, data);
                showToast('Household updated.');
            } else {
                await addHousehold(data);
                showToast('Household registered.');
            }
            setValidated(false);
            closeHouseholdModal();
        } catch (err) {
            showToast(err.message || 'Failed to save household.', true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={householdModal.open} onHide={closeHouseholdModal} size="lg" fullscreen="sm-down" scrollable>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingHousehold ? 'Update Household Info' : 'Register New Household'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="householdPurok">
                                <Form.Label>Purok <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.purok} onChange={(e) => updateField('purok', e.target.value)}>
                                    <option value="">Select Purok</option>
                                    {PUROKS.map((p) => <option key={p}>{p}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Purok is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-8">
                            <Form.Group controlId="householdAddress">
                                <Form.Label>Address Detail <span className="required-marker">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. 123 Mabini St."
                                    required
                                    value={form.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">Address is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        <div className="col-12">
                            <Form.Group controlId="householdHead">
                                <Form.Label>Head of Family <span className="required-marker">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Maria Santos"
                                    required
                                    value={form.headOfFamily}
                                    onChange={(e) => updateField('headOfFamily', e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">Head of family is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        <div className="col-12">
                            <p className="text-muted small mb-0">
                                Family, voter, PWD, and senior member counts are calculated automatically from residents linked to this household — assign a resident to it via the Household field on their profile.
                            </p>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeHouseholdModal} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Saving…' : 'Save Household'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
