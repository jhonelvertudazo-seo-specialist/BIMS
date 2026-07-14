import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function DeleteResidentModal() {
    const { residents, deleteResident } = useData();
    const { residentDeleteId, closeDeleteResident, showToast } = useUI();
    const resident = residents.find((r) => r.id === residentDeleteId);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await deleteResident(resident.id);
            showToast('Resident record deleted.');
            closeDeleteResident();
        } catch (err) {
            showToast(err.message || 'Failed to delete resident.', true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal show={!!resident} onHide={closeDeleteResident}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Resident</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete <strong>{resident?.fullName}</strong>? This cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeDeleteResident} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
