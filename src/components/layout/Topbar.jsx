import { Dropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials, nameFromEmail } from '../../utils/format.js';
import { PAGE_TITLES } from '../../utils/pageTitles.js';
import { findBreadcrumb } from '../../utils/navTree.js';

export default function Topbar({ onToggleSidebar }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const match = findBreadcrumb(location.pathname);
    const title = match?.leaf || PAGE_TITLES[location.pathname] || 'Dashboard';
    const displayName = nameFromEmail(user?.email);

    async function handleLogout() {
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <nav className="navbar navbar-light bg-white border-bottom px-3 sticky-top">
            <button
                className="btn btn-outline-secondary d-lg-none"
                type="button"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
            >
                ☰
            </button>
            <span className="navbar-brand mb-0 h5 text-truncate topbar-title">{title}</span>

            <div className="d-flex align-items-center gap-3 ms-auto flex-shrink-0">
                <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                    <Dropdown.Toggle as="button" className="btn btn-light d-flex align-items-center gap-2 border">
                        <span className="avatar-badge rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center">
                            {initials(displayName)}
                        </span>
                        <span className="d-none d-md-inline">{displayName}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.ItemText className="text-muted small">{user?.email}</Dropdown.ItemText>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => navigate('/profile')}>My Profile</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </nav>
    );
}
