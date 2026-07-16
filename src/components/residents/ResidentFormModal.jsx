import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { uploadFile } from '../../lib/uploadFile.js';
import {
    PUROKS, SECTORS, CIVIL_STATUSES, EMPLOYMENT_STATUSES,
    EDUCATIONAL_ATTAINMENTS, RESIDENT_STATUSES,
} from '../../utils/constants.js';

const EMPTY_FORM = {
    firstName: '', middleName: '', lastName: '', suffix: '',
    gender: '', birthDate: '', birthPlace: '', nationality: 'Filipino', religion: '',
    purok: '', householdId: '', sitio: '', address: '', district: '', pollingPlace: '', precinctNumber: '',
    civilStatus: '', sector: '', employmentStatus: 'Employed', occupation: '', employer: '',
    monthlyIncome: '', educationalAttainment: '',
    contact: '', email: '', registeredVoter: false,
    philsysNo: '', philhealthNo: '', sssNo: '', pagibigNo: '', tin: '',
    photoUrl: '', status: 'Active',
};

export default function ResidentFormModal() {
    const { residents, households, addResident, updateResident } = useData();
    const { residentModal, closeResidentModal, showToast } = useUI();
    const { user } = useAuth();
    const [form, setForm] = useState(EMPTY_FORM);
    const [photoFile, setPhotoFile] = useState(null);
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const editingResident = residentModal.id ? residents.find((r) => r.id === residentModal.id) : null;

    useEffect(() => {
        if (!residentModal.open) return;
        setValidated(false);
        setPhotoFile(null);
        if (editingResident) {
            // Residents registered before names were split into separate
            // columns have firstName/lastName as null in the DB even
            // though fullName is populated. Fall back to splitting
            // fullName so the edit form doesn't show blank name fields
            // for those older records (see migration 0013 for the
            // one-time DB backfill of this same data).
            const [fallbackFirst, ...fallbackRest] = (editingResident.fullName || '').trim().split(/\s+/).filter(Boolean);
            const fallbackLast = fallbackRest.length ? fallbackRest[fallbackRest.length - 1] : '';

            setForm({
                firstName: editingResident.firstName || fallbackFirst || '',
                middleName: editingResident.middleName || '',
                lastName: editingResident.lastName || fallbackLast || '',
                suffix: editingResident.suffix || '',
                gender: editingResident.gender,
                birthDate: editingResident.birthDate,
                birthPlace: editingResident.birthPlace || '',
                nationality: editingResident.nationality || 'Filipino',
                religion: editingResident.religion || '',
                purok: editingResident.purok,
                householdId: editingResident.householdId || '',
                sitio: editingResident.sitio || '',
                address: editingResident.address || '',
                district: editingResident.district || '',
                pollingPlace: editingResident.pollingPlace || '',
                precinctNumber: editingResident.precinctNumber || '',
                civilStatus: editingResident.civilStatus,
                sector: editingResident.sector,
                employmentStatus: editingResident.employmentStatus || 'Employed',
                occupation: editingResident.occupation || '',
                employer: editingResident.employer || '',
                monthlyIncome: editingResident.monthlyIncome ?? '',
                educationalAttainment: editingResident.educationalAttainment || '',
                contact: editingResident.contact || '',
                email: editingResident.email || '',
                registeredVoter: !!editingResident.registeredVoter,
                philsysNo: editingResident.philsysNo || '',
                philhealthNo: editingResident.philhealthNo || '',
                sssNo: editingResident.sssNo || '',
                pagibigNo: editingResident.pagibigNo || '',
                tin: editingResident.tin || '',
                photoUrl: editingResident.photoUrl || '',
                status: editingResident.status || 'Active',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [residentModal.open, residentModal.id]);

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

        const fullName = [form.firstName.trim(), form.middleName.trim(), form.lastName.trim(), form.suffix.trim()]
            .filter(Boolean)
            .join(' ');

        setSubmitting(true);
        try {
            let photoUrl = form.photoUrl;
            if (photoFile) {
                photoUrl = await uploadFile(photoFile, 'residents');
            }

            const data = {
                ...form,
                fullName,
                firstName: form.firstName.trim(),
                middleName: form.middleName.trim(),
                lastName: form.lastName.trim(),
                address: form.address.trim(),
                occupation: form.occupation.trim(),
                contact: form.contact.trim(),
                monthlyIncome: form.monthlyIncome === '' ? null : Number(form.monthlyIncome),
                photoUrl,
            };

            if (editingResident) {
                await updateResident(editingResident.id, data);
                showToast('Resident profile updated.');
            } else {
                await addResident({ ...data, registeredBy: user?.email || '' });
                showToast('Resident registered.');
            }
            setValidated(false);
            closeResidentModal();
        } catch (err) {
            showToast(err.message || 'Failed to save resident.', true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={residentModal.open} onHide={closeResidentModal} size="lg" fullscreen="sm-down" scrollable>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingResident ? 'Edit Resident Profile' : 'Register New Resident'}</Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Personal Information</h6>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4">
                            <Form.Group controlId="residentFirstName">
                                <Form.Label>First Name <span className="required-marker">*</span></Form.Label>
                                <Form.Control required value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                                <Form.Control.Feedback type="invalid">First name is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="residentMiddleName">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentLastName">
                                <Form.Label>Last Name <span className="required-marker">*</span></Form.Label>
                                <Form.Control required value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                                <Form.Control.Feedback type="invalid">Last name is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-2">
                            <Form.Group controlId="residentSuffix">
                                <Form.Label>Suffix</Form.Label>
                                <Form.Control placeholder="Jr." value={form.suffix} onChange={(e) => updateField('suffix', e.target.value)} />
                            </Form.Group>
                        </div>

                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentGender">
                                <Form.Label>Gender <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Gender is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentBirthDate">
                                <Form.Label>Birth Date <span className="required-marker">*</span></Form.Label>
                                <Form.Control type="date" required value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} />
                                <Form.Control.Feedback type="invalid">Birth date is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentBirthPlace">
                                <Form.Label>Birth Place</Form.Label>
                                <Form.Control value={form.birthPlace} onChange={(e) => updateField('birthPlace', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentCivilStatus">
                                <Form.Label>Civil Status <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.civilStatus} onChange={(e) => updateField('civilStatus', e.target.value)}>
                                    <option value="">Select</option>
                                    {CIVIL_STATUSES.map((c) => <option key={c}>{c}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Civil status is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentNationality">
                                <Form.Label>Nationality</Form.Label>
                                <Form.Control value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentReligion">
                                <Form.Label>Religion</Form.Label>
                                <Form.Control value={form.religion} onChange={(e) => updateField('religion', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-3">
                            <Form.Group controlId="residentPhoto">
                                <Form.Label>Photo</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                            </Form.Group>
                        </div>
                    </div>

                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Address</h6>
                    <div className="row g-3 mb-3">
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentPurok">
                                <Form.Label>Purok <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.purok} onChange={(e) => updateField('purok', e.target.value)}>
                                    <option value="">Select Purok</option>
                                    {PUROKS.map((p) => <option key={p}>{p}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Purok is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentSitio">
                                <Form.Label>Sitio</Form.Label>
                                <Form.Control value={form.sitio} onChange={(e) => updateField('sitio', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="residentAddress">
                                <Form.Label>Address Detail</Form.Label>
                                <Form.Control placeholder="e.g. 123 Mabini St." value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="residentHousehold">
                                <Form.Label>Household</Form.Label>
                                <Form.Select value={form.householdId} onChange={(e) => updateField('householdId', e.target.value)}>
                                    <option value="">Not linked to a household</option>
                                    {households.map((h) => (
                                        <option key={h.id} value={h.id}>{h.householdNo} — {h.headOfFamily}{h.address ? ` (${h.address})` : ''}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">Linking this resident lets household member counts update automatically.</Form.Text>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="residentDistrict">
                                <Form.Label>District</Form.Label>
                                <Form.Control value={form.district} onChange={(e) => updateField('district', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="residentPollingPlace">
                                <Form.Label>Polling Place</Form.Label>
                                <Form.Control value={form.pollingPlace} onChange={(e) => updateField('pollingPlace', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="residentPrecinct">
                                <Form.Label>Precinct Number</Form.Label>
                                <Form.Control value={form.precinctNumber} onChange={(e) => updateField('precinctNumber', e.target.value)} />
                            </Form.Group>
                        </div>
                    </div>

                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Socioeconomic</h6>
                    <div className="row g-3 mb-3">
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentSector">
                                <Form.Label>Sector <span className="required-marker">*</span></Form.Label>
                                <Form.Select required value={form.sector} onChange={(e) => updateField('sector', e.target.value)}>
                                    <option value="">Select</option>
                                    {SECTORS.map((s) => <option key={s}>{s}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Sector is required.</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentEmploymentStatus">
                                <Form.Label>Employment Status</Form.Label>
                                <Form.Select value={form.employmentStatus} onChange={(e) => updateField('employmentStatus', e.target.value)}>
                                    {EMPLOYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-3">
                            <Form.Group controlId="residentOccupation">
                                <Form.Label>Occupation</Form.Label>
                                <Form.Control placeholder="e.g. Vendor" value={form.occupation} onChange={(e) => updateField('occupation', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-3">
                            <Form.Group controlId="residentEmployer">
                                <Form.Label>Employer</Form.Label>
                                <Form.Control value={form.employer} onChange={(e) => updateField('employer', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentMonthlyIncome">
                                <Form.Label>Monthly Income</Form.Label>
                                <Form.Control type="number" min="0" step="0.01" value={form.monthlyIncome} onChange={(e) => updateField('monthlyIncome', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Group controlId="residentEducation">
                                <Form.Label>Educational Attainment</Form.Label>
                                <Form.Select value={form.educationalAttainment} onChange={(e) => updateField('educationalAttainment', e.target.value)}>
                                    <option value="">Select</option>
                                    {EDUCATIONAL_ATTAINMENTS.map((e) => <option key={e}>{e}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-2">
                            <Form.Group controlId="residentStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                                    {RESIDENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>

                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Contact & Voter</h6>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4">
                            <Form.Group controlId="residentContact">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control type="tel" placeholder="e.g. 0917 123 4567" value={form.contact} onChange={(e) => updateField('contact', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-4">
                            <Form.Group controlId="residentEmail">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-4 d-flex align-items-end">
                            <Form.Check
                                type="checkbox"
                                id="residentVoter"
                                label="Registered voter"
                                checked={form.registeredVoter}
                                onChange={(e) => updateField('registeredVoter', e.target.checked)}
                            />
                        </div>
                    </div>

                    <h6 className="text-muted text-uppercase small fw-bold mb-2">Government IDs</h6>
                    {editingResident && (
                        <p className="text-muted small mb-2">Government ID numbers are locked after registration. Contact a system administrator if a correction is needed.</p>
                    )}
                    <div className="row g-3">
                        <div className="col-6 col-md-2">
                            <Form.Group controlId="residentPhilsys">
                                <Form.Label>PhilSys No.</Form.Label>
                                <Form.Control value={form.philsysNo} onChange={(e) => updateField('philsysNo', e.target.value)} readOnly={!!editingResident} disabled={!!editingResident} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-2">
                            <Form.Group controlId="residentPhilhealth">
                                <Form.Label>PhilHealth No.</Form.Label>
                                <Form.Control value={form.philhealthNo} onChange={(e) => updateField('philhealthNo', e.target.value)} readOnly={!!editingResident} disabled={!!editingResident} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-2">
                            <Form.Group controlId="residentSss">
                                <Form.Label>SSS No.</Form.Label>
                                <Form.Control value={form.sssNo} onChange={(e) => updateField('sssNo', e.target.value)} readOnly={!!editingResident} disabled={!!editingResident} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentPagibig">
                                <Form.Label>Pag-IBIG No.</Form.Label>
                                <Form.Control value={form.pagibigNo} onChange={(e) => updateField('pagibigNo', e.target.value)} readOnly={!!editingResident} disabled={!!editingResident} />
                            </Form.Group>
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Group controlId="residentTin">
                                <Form.Label>TIN</Form.Label>
                                <Form.Control value={form.tin} onChange={(e) => updateField('tin', e.target.value)} readOnly={!!editingResident} disabled={!!editingResident} />
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeResidentModal} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Saving…' : 'Save Resident'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
