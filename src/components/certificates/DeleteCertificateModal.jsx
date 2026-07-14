import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function DeleteCertificateModal() {
    const { certificates, deleteCertificate } = useData();
    const { certificateDeleteId, closeDeleteCertificate, showToast } = useUI();
    const certificate = certificates.find((c) => c.id === certificateDeleteId);
    const [deleting, setDeleting] = useState(false);

    async function handleConfirm() {
        setDeleting(true);
        try {
            await deleteCertificate(certificate.id);
            showToast('Certificate record deleted.');
            closeDeleteCertificate();
        } catch (err) {
            showToast(err.message || 'Failed to delete certificate.', true);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal show={!!certificate} onHide={closeDeleteCertificate}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Certificate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete <strong>{certificate?.type}</strong> ({certificate?.referenceNo}) issued to <strong>{certificate?.residentName}</strong>? This cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeDeleteCertificate} disabled={deleting}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
