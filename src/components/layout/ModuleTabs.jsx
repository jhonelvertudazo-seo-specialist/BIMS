import { NavLink, useLocation } from 'react-router-dom';
import { findGroupForPath } from '../../utils/navTree.js';

export default function ModuleTabs() {
    const location = useLocation();
    const group = findGroupForPath(location.pathname);

    if (!group || !group.children || group.children.length < 2) return null;

    return (
        <ul className="nav nav-tabs module-tabs mb-3">
            {group.children.map((child) => (
                <li className="nav-item" key={child.label}>
                    {child.soon ? (
                        <span className="nav-link disabled d-flex align-items-center gap-1">
                            {child.label}
                            <span className="badge bg-secondary-subtle text-secondary badge-soon">Soon</span>
                        </span>
                    ) : (
                        <NavLink to={child.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            {child.label}
                        </NavLink>
                    )}
                </li>
            ))}
        </ul>
    );
}
