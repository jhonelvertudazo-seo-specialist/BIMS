import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { initials } from '../../utils/format.js';

function Field({ label, value }) {
    return (
        <div className="col-6 col-md-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value}</div>
        </div>
    );
}

export default function HouseholdViewModal() {
    const { households } = useData();
    const { householdViewId, closeViewHousehold, openEditHousehold } = useUI();
    const household = households.find((h) => h.id === householdViewId);

    function handleEdit() {
        const id = household.id;
        closeViewHousehold();
        openEditHousehold(id);
    }

    return (
        <Modal show={!!household} onHide={closeViewHousehold} size="lg" fullscreen="sm-down" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Household Members</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {household && (
                    <div className="row g-3">
                        <div className="col-12 d-flex align-items-center gap-3 mb-2">
                            <div className="resident-avatar" style={{ width: 56, height: 56, fontSize: '1.1rem' }}>
                                {initials(household.headOfFamily)}
                            </div>
                            <div>
                                <div className="fs-5 fw-semibold">{household.headOfFamily}</div>
                                <div className="text-muted small">{household.householdNo} · Head of Family</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-6">
                            <div className="text-muted small">Purok</div>
                            <div className="fw-medium">{household.purok}</div>
                        </div>
                        <div className="col-6 col-md-6">
                            <div className="text-muted small">Address Detail</div>
                            <div className="fw-medium">{household.address || '—'}</div>
                        </div>
                        <Field label="Family Members" value={household.familyMembersCount} />
                        <Field label="Voter Members" value={household.voterMembersCount} />
                        <Field label="PWD Members" value={household.pwdMembersCount} />
                        <Field label="Senior Members" value={household.seniorMembersCount} />
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeViewHousehold}>Close</Button>
                <Button variant="primary" onClick={handleEdit}>Update Info</Button>
            </Modal.Footer>
        </Modal>
    );
}
