import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function GenericDeleteModal({ config, item, onClose, onConfirm, showToast }) {
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await onConfirm(item.id);
            showToast(`${config.title} record deleted.`);
            onClose();
        } catch (err) {
            showToast(err.message || `Failed to delete ${config.title.toLowerCase()}.`, true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal show={!!item} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete {config.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Are you sure you want to delete this {config.title.toLowerCase()} record
                    {item && config.deleteLabel ? <> (<strong>{config.deleteLabel(item)}</strong>)</> : null}?
                    This cannot be undone.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
