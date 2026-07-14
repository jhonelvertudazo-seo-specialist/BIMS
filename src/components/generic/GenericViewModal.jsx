import { Modal, Button } from 'react-bootstrap';
import { resolveFieldDisplay } from '../../lib/genericDisplay.js';

export default function GenericViewModal({ config, item, onClose, onEdit, lookupData }) {
    return (
        <Modal show={!!item} onHide={onClose} size="lg" fullscreen="sm-down" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>{config.title} Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {item && (
                    <div className="row g-3">
                        {config.fields.map((field) => (
                            <div className={field.col || 'col-12 col-md-6'} key={field.key}>
                                <div className="text-muted small">{field.label}</div>
                                <div className="fw-medium">{resolveFieldDisplay(field, item, lookupData)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={onEdit}>Edit</Button>
            </Modal.Footer>
        </Modal>
    );
}
