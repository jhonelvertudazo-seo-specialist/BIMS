import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
    const { session, loading, appUser, isApproved, signOut } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isApproved) {
        const status = appUser?.accountStatus || 'Pending';
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
                <div className="card border-0 shadow-lg" style={{ maxWidth: 420 }}>
                    <div className="card-body p-4 p-md-5 text-center">
                        <span className="fs-1 d-block mb-3">{status === 'Suspended' ? '🚫' : '🕓'}</span>
                        <h1 className="h5 fw-bold mb-2">
                            {status === 'Suspended' ? 'Account Suspended' : 'Account Pending Approval'}
                        </h1>
                        <p className="text-muted small mb-4">
                            {status === 'Suspended'
                                ? 'Your account has been suspended. Please contact a barangay administrator.'
                                : 'Your account has been created and is waiting for an administrator to approve access. Please check back later.'}
                        </p>
                        <button type="button" className="btn btn-outline-secondary w-100" onClick={signOut}>Sign Out</button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
