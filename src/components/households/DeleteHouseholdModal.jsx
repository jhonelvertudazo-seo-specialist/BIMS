import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function DeleteHouseholdModal() {
    const { households, deleteHousehold } = useData();
    const { householdDeleteId, closeDeleteHousehold, showToast } = useUI();
    const household = households.find((h) => h.id === householdDeleteId);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await deleteHousehold(household.id);
            showToast('Household record deleted.');
            closeDeleteHousehold();
        } catch (err) {
            showToast(err.message || 'Failed to delete household.', true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal show={!!household} onHide={closeDeleteHousehold}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Household</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete household <strong>{household?.householdNo}</strong> ({household?.headOfFamily})? This cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeDeleteHousehold} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
