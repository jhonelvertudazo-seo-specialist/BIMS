import { ToastContainer, Toast } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';

export default function ToastHost() {
    const { toast, hideToast } = useUI();

    return (
        <ToastContainer className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1090 }}>
            <Toast
                show={toast.show}
                onClose={hideToast}
                delay={2500}
                autohide
                bg={toast.isError ? 'danger' : 'success'}
                className="text-white border-0"
            >
                <Toast.Body className="d-flex justify-content-between align-items-center">
                    <span>{toast.isError ? '⚠️' : '✅'} {toast.message}</span>
                    <button type="button" className="btn-close btn-close-white ms-2" onClick={hideToast} aria-label="Close"></button>
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}
