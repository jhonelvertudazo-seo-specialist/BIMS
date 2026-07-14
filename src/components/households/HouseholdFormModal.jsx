import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { PUROKS } from '../../utils/constants.js';

const EMPTY_FORM = {
    purok: '', address: '', headOfFamily: '',
    familyMembersCount: 0, voterMembersCount: 0, pwdMembersCount: 0, seniorMembersCount: 0,
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
                familyMembersCount: editingHousehold.familyMembersCount,
                voterMembersCount: editingHousehold.voterMembersCount,
                pwdMembersCount: editingHousehold.pwdMembersCount,
                seniorMembersCount: editingHousehold.seniorMembersCount,
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
            familyMembersCount: Number(form.familyMembersCount) || 0,
            voterMembersCount: Number(form.voterMembersCount) || 0,
            pwdMembersCount: Number(form.pwdMembersCount) || 0,
            seniorMembersCount: Number(form.seniorMembersCount) || 0,
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

                        <div className="col-6 col-md-3">
                            <Form.Group controlId="householdFamilyCount">
                                <Form.Label>Family Members</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.familyMembersCount}
                                    onChange={(e) => updateField('familyMembersCount', e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="householdVoterCount">
                                <Form.Label>Voter Members</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.voterMembersCount}
                                    onChange={(e) => updateField('voterMembersCount', e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="householdPwdCount">
                                <Form.Label>PWD Members</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.pwdMembersCount}
                                    onChange={(e) => updateField('pwdMembersCount', e.target.value)}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="householdSeniorCount">
                                <Form.Label>Senior Members</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={form.seniorMembersCount}
                                    onChange={(e) => updateField('seniorMembersCount', e.target.value)}
                                />
                            </Form.Group>
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
