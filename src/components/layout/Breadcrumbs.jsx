import { Link, useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '../../utils/pageTitles.js';
import { findBreadcrumb } from '../../utils/navTree.js';

export default function Breadcrumbs() {
    const location = useLocation();
    const isDashboard = location.pathname === '/';
    const match = findBreadcrumb(location.pathname);
    const leaf = match?.leaf || PAGE_TITLES[location.pathname] || 'Dashboard';
    const group = match?.group;

    return (
        <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0 small">
                <li className={`breadcrumb-item${isDashboard ? ' active' : ''}`} aria-current={isDashboard ? 'page' : undefined}>
                    {isDashboard ? 'Dashboard' : <Link to="/">Dashboard</Link>}
                </li>
                {!isDashboard && group && (
                    <li className="breadcrumb-item text-muted">{group}</li>
                )}
                {!isDashboard && (
                    <li className="breadcrumb-item active" aria-current="page">{leaf}</li>
                )}
            </ol>
        </nav>
    );
}
