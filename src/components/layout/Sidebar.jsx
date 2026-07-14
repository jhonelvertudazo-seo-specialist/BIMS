import { NavLink, useLocation } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';
import { nameFromEmail } from '../../utils/format.js';
import { NAV_TREE } from '../../utils/navTree.js';

function GroupLink({ group, onNavigate }) {
    const location = useLocation();
    const firstReal = group.children.find((c) => c.to);
    const isActiveGroup = group.children.some((c) => c.to === location.pathname);

    if (!firstReal) {
        return (
            <a
                href="#"
                className="nav-link disabled d-flex align-items-center gap-2"
                aria-disabled="true"
                title="Coming soon"
                onClick={(e) => e.preventDefault()}
            >
                <span className="nav-icon">{group.icon}</span> {group.label}
                <span className="badge bg-secondary-subtle text-secondary badge-soon ms-auto">Soon</span>
            </a>
        );
    }

    return (
        <NavLink
            to={firstReal.to}
            className={() => `nav-link d-flex align-items-center gap-2${isActiveGroup ? ' active' : ''}`}
            onClick={onNavigate}
        >
            <span className="nav-icon">{group.icon}</span> {group.label}
        </NavLink>
    );
}

function FlatLink({ item, onNavigate }) {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link d-flex align-items-center gap-2${isActive ? ' active' : ''}`}
            onClick={onNavigate}
        >
            <span className="nav-icon">{item.icon}</span> {item.label}
        </NavLink>
    );
}

function SidebarNav({ onNavigate }) {
    const { user } = useAuth();
    const displayName = nameFromEmail(user?.email);

    return (
        <div className="offcanvas-body d-flex flex-column p-0">
            <div className="sidebar-brand d-none d-lg-flex align-items-center gap-2 px-3 py-3">
                <span className="sidebar-brand-icon">🏛️</span>
                <span className="fs-5 fw-semibold">BIMS</span>
            </div>

            <ul className="nav nav-pills flex-column px-2 gap-1 mt-lg-2 sidebar-scroll">
                {NAV_TREE.map((item) => (
                    <li className="nav-item" key={item.label}>
                        {item.children
                            ? <GroupLink group={item} onNavigate={onNavigate} />
                            : <FlatLink item={item} onNavigate={onNavigate} />}
                    </li>
                ))}
            </ul>

            <div className="mt-auto px-3 py-3 border-top small text-muted">
                Signed in as <strong className="text-body">{displayName}</strong>
            </div>
        </div>
    );
}

export default function Sidebar({ show, onHide }) {
    return (
        <Offcanvas show={show} onHide={onHide} responsive="lg" className="sidebar" placement="start">
            <Offcanvas.Header closeButton className="d-lg-none">
                <Offcanvas.Title>BIMS</Offcanvas.Title>
            </Offcanvas.Header>
            <SidebarNav onNavigate={onHide} />
        </Offcanvas>
    );
}
