import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(location.state?.idleTimeout ? 'You were signed out due to inactivity. Please sign in again.' : '');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await signIn(email.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message === 'Invalid login credentials'
                ? 'Incorrect email or password. Please try again.'
                : err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-page d-flex align-items-center justify-content-center min-vh-100 p-3">
            <div className="login-card card border-0 shadow-lg">
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex flex-column align-items-center text-center mb-4">
                        <span className="sidebar-brand-icon login-brand-icon mb-3">🏛️</span>
                        <h1 className="h4 fw-bold mb-1">BIMS</h1>
                        <p className="text-muted small mb-0">Barangay Information and Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {error && (
                            <div className="alert alert-danger py-2 small" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <label htmlFor="loginEmail" className="form-label">Email address</label>
                            <input
                                id="loginEmail"
                                type="email"
                                className="form-control"
                                placeholder="you@barangay.gov.ph"
                                autoComplete="username"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="loginPassword" className="form-label">Password</label>
                            <div className="input-group">
                                <input
                                    id="loginPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={submitting}>
                            {submitting ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-muted small mt-4 mb-0">
                        Authorized Barangay personnel only.
                    </p>
                </div>
            </div>
        </div>
    );
}
