import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { initials, nameFromEmail } from '../utils/format.js';

function formatDateTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
}

function InfoRow({ label, value }) {
    return (
        <div className="d-flex justify-content-between align-items-center py-2 border-top">
            <span className="text-muted small">{label}</span>
            <span className="fw-medium text-end">{value}</span>
        </div>
    );
}

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const displayName = nameFromEmail(user?.email);

    async function handleLogout() {
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <section className="app-view">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 text-center">
                            <div
                                className="resident-avatar mx-auto mb-3"
                                style={{ width: 72, height: 72, fontSize: '1.5rem' }}
                            >
                                {initials(displayName)}
                            </div>
                            <h5 className="mb-1">{displayName}</h5>
                            <p className="text-muted small mb-4">Barangay Administrator</p>

                            <div className="text-start">
                                <InfoRow label="Email address" value={user?.email || '—'} />
                                <InfoRow label="Account created" value={formatDateTime(user?.created_at)} />
                                <InfoRow label="Last sign-in" value={formatDateTime(user?.last_sign_in_at)} />
                                <InfoRow label="User ID" value={<span className="small text-muted">{user?.id}</span>} />
                            </div>

                            <button type="button" className="btn btn-outline-danger w-100 mt-4" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
