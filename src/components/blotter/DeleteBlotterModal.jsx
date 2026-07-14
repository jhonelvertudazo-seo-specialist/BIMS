import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function DeleteBlotterModal() {
    const { blotters, deleteBlotter } = useData();
    const { blotterDeleteId, closeDeleteBlotter, showToast } = useUI();
    const blotter = blotters.find((b) => b.id === blotterDeleteId);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await deleteBlotter(blotter.id);
            showToast('Blotter case deleted.');
            closeDeleteBlotter();
        } catch (err) {
            showToast(err.message || 'Failed to delete case.', true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal show={!!blotter} onHide={closeDeleteBlotter}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Blotter Case</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete case <strong>{blotter?.caseNo}</strong> ({blotter?.complainant} vs {blotter?.respondent})? This cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeDeleteBlotter} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
