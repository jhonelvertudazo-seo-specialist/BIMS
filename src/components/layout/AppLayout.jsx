import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import ModuleTabs from './ModuleTabs.jsx';
import { useIdleLogout } from '../../hooks/useIdleLogout.js';

export default function AppLayout() {
    const [sidebarShow, setSidebarShow] = useState(false);
    useIdleLogout();

    return (
        <div className="d-flex" id="wrapper">
            <Sidebar show={sidebarShow} onHide={() => setSidebarShow(false)} />

            <div className="flex-grow-1 min-vw-0 main-content">
                <Topbar onToggleSidebar={() => setSidebarShow(true)} />
                <div className="p-3 p-md-4">
                    <Breadcrumbs />
                    <ModuleTabs />
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
