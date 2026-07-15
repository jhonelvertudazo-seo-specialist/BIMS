import { useAuth } from '../../context/AuthContext.jsx';

export default function RequirePermission({ moduleKey, action = 'view', children }) {
    const { can } = useAuth();
    if (!can(moduleKey, action)) {
        return (
            <section className="app-view">
                <div className="text-center text-muted py-5">
                    <p className="fs-1 mb-2">🔒</p>
                    <p className="fs-5">You don&apos;t have access to this module.</p>
                    <p>Contact an administrator if you believe this is a mistake.</p>
                </div>
            </section>
        );
    }
    return children;
}
