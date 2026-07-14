import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate, calculateAge, initials, formatCurrency } from '../../utils/format.js';

function Field({ label, value, wide }) {
    return (
        <div className={wide ? 'col-6 col-md-8' : 'col-6 col-md-4'}>
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value || '—'}</div>
        </div>
    );
}

export default function ResidentViewModal() {
    const { residents } = useData();
    const { residentViewId, closeViewResident, openEditResident } = useUI();
    const resident = residents.find((r) => r.id === residentViewId);

    function handleEdit() {
        const id = resident.id;
        closeViewResident();
        openEditResident(id);
    }

    return (
        <Modal show={!!resident} onHide={closeViewResident} size="lg" fullscreen="sm-down" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Resident Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {resident && (
                    <div className="row g-3">
                        <div className="col-12 d-flex align-items-center gap-3 mb-2">
                            {resident.photoUrl ? (
                                <img src={resident.photoUrl} alt={resident.fullName} className="resident-avatar" style={{ width: 56, height: 56, objectFit: 'cover' }} />
                            ) : (
                                <div className="resident-avatar" style={{ width: 56, height: 56, fontSize: '1.1rem' }}>
                                    {initials(resident.fullName)}
                                </div>
                            )}
                            <div>
                                <div className="fs-5 fw-semibold">{resident.fullName}</div>
                                <div className="text-muted small">{resident.residentId} · {resident.status}</div>
                            </div>
                        </div>

                        <Field label="Gender" value={resident.gender} />
                        <Field label="Birth Date" value={`${formatDate(resident.birthDate)}${calculateAge(resident.birthDate) != null ? ` (${calculateAge(resident.birthDate)} yrs)` : ''}`} />
                        <Field label="Birth Place" value={resident.birthPlace} />
                        <Field label="Civil Status" value={resident.civilStatus} />
                        <Field label="Nationality" value={resident.nationality} />
                        <Field label="Religion" value={resident.religion} />

                        <Field label="Purok" value={resident.purok} />
                        <Field label="Sitio" value={resident.sitio} />
                        <Field label="Address Detail" value={resident.address} wide />
                        <Field label="District" value={resident.district} />
                        <Field label="Polling Place" value={resident.pollingPlace} />
                        <Field label="Precinct Number" value={resident.precinctNumber} />

                        <Field label="Sector" value={resident.sector} />
                        <Field label="Employment Status" value={resident.employmentStatus} />
                        <Field label="Occupation" value={resident.occupation} />
                        <Field label="Employer" value={resident.employer} />
                        <Field label="Monthly Income" value={resident.monthlyIncome ? formatCurrency(resident.monthlyIncome) : ''} />
                        <Field label="Educational Attainment" value={resident.educationalAttainment} />

                        <Field label="Contact Number" value={resident.contact} />
                        <Field label="Email Address" value={resident.email} />
                        <Field label="Registered Voter" value={resident.registeredVoter ? 'Yes' : 'No'} />

                        <Field label="PhilSys No." value={resident.philsysNo} />
                        <Field label="PhilHealth No." value={resident.philhealthNo} />
                        <Field label="SSS No." value={resident.sssNo} />
                        <Field label="Pag-IBIG No." value={resident.pagibigNo} />
                        <Field label="TIN" value={resident.tin} />
                        <Field label="Registered By" value={resident.registeredBy} />
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeViewResident}>Close</Button>
                <Button variant="primary" onClick={handleEdit}>Edit Profile</Button>
            </Modal.Footer>
        </Modal>
    );
}
