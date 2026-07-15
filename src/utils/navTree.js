export function findBreadcrumb(pathname) {
    for (const item of NAV_TREE) {
        if (!item.children) {
            if (item.to === pathname) return { leaf: item.label };
            continue;
        }
        for (const child of item.children) {
            if (child.to === pathname) return { group: item.label, leaf: child.label };
        }
    }
    return null;
}

export function findGroupForPath(pathname) {
    for (const item of NAV_TREE) {
        if (!item.children) continue;
        if (item.children.some((child) => child.to === pathname)) return item;
    }
    return null;
}

export const NAV_TREE = [
    { to: '/', icon: '📊', label: 'Dashboard', end: true },
    {
        icon: '👥', label: 'Resident Management',
        children: [
            { to: '/residents', label: 'Resident' },
            { to: '/households', label: 'Household' },
            { to: '/puroks', label: 'Purok' },
            { to: '/families', label: 'Family Profiling' },
            { to: '/senior-citizens', label: 'Senior Citizens' },
            { to: '/pwd', label: 'PWD Section' },
            { to: '/solo-parents', label: 'Solo Parents' },
            { to: '/voters', label: 'Voters Information' },
            { to: '/youth', label: 'Youth (SK)' },
            { to: '/resident-search', label: 'Resident Search' },
        ],
    },
    {
        icon: '📄', label: 'Certificate Management',
        children: [
            { to: '/certificates', label: 'Certificates' },
        ],
    },
    {
        icon: '📁', label: 'Blotter Management',
        children: [
            { to: '/blotter', label: 'Blotter Records' },
        ],
    },
    {
        icon: '🏪', label: 'Business Management',
        children: [
            { to: '/businesses', label: 'Business Registration' },
            { to: '/business-clearance', label: 'Business Clearance' },
            { to: '/permit-renewal', label: 'Permit Renewal' },
            { to: '/business-owners', label: 'Business Owners' },
            { to: '/business-reports', label: 'Reports' },
        ],
    },
    {
        icon: '🏥', label: 'Health Services',
        children: [
            { to: '/health-records', label: 'Health Records' },
            { to: '/vaccinations', label: 'Vaccination' },
            { to: '/prenatal-care', label: 'Prenatal Care' },
            { to: '/medical-assistance', label: 'Medical Assistance' },
            { to: '/medicine-inventory', label: 'Medicine Inventory' },
        ],
    },
    {
        icon: '🚨', label: 'Disaster Risk Reduction',
        children: [
            { to: '/evacuation-centers', label: 'Evacuation Centers' },
            { to: '/relief-distribution', label: 'Relief Distribution' },
            { to: '/disaster-incidents', label: 'Disaster Incidents' },
            { to: '/rescue-operations', label: 'Rescue Operations' },
            { to: '/disaster-reports', label: 'Disaster Reports' },
        ],
    },
    {
        icon: '💰', label: 'Financial Management',
        children: [
            { to: '/collections', label: 'Collection' },
            { to: '/receipts', label: 'Official Receipts' },
            { to: '/expenses', label: 'Expenses' },
            { to: '/budget', label: 'Budget' },
            { to: '/financial-reports', label: 'Financial Reports' },
            { to: '/audit-trail', label: 'Audit Trail' },
        ],
    },
    {
        icon: '📈', label: 'Projects & Programs',
        children: [
            { to: '/projects', label: 'Community Projects' },
            { to: '/livelihood-programs', label: 'Livelihood Programs' },
            { to: '/scholarship-programs', label: 'Scholarship Programs' },
            { to: '/beneficiaries', label: 'Beneficiaries' },
            { to: '/progress-monitoring', label: 'Progress Monitoring' },
        ],
    },
    {
        icon: '🗄️', label: 'Document Management',
        children: [
            { to: '/documents', label: 'Uploaded Files' },
            { to: '/ordinances', label: 'Ordinances' },
            { to: '/resolutions', label: 'Resolutions' },
            { to: '/meeting-minutes', label: 'Meeting Minutes' },
            { to: '/archive', label: 'Archive' },
        ],
    },
    {
        icon: '📦', label: 'Inventory & Asset Management',
        children: [
            { to: '/equipment', label: 'Equipment' },
            { to: '/supplies', label: 'Supplies' },
            { label: 'Vehicle Management', soon: true },
            { to: '/asset-assignment', label: 'Asset Assignment' },
            { to: '/maintenance', label: 'Maintenance' },
        ],
    },
    {
        icon: '🗓️', label: 'Scheduling',
        children: [
            { to: '/appointments', label: 'Appointments' },
            { to: '/events', label: 'Events' },
            { to: '/barangay-sessions', label: 'Barangay Sessions' },
            { to: '/calendar', label: 'Calendar' },
        ],
    },
    { to: '/reports', icon: '📊', label: 'Reports & Analytics' },
    {
        icon: '🛡️', label: 'User Management',
        children: [
            { to: '/users', label: 'Users' },
            { to: '/roles', label: 'Roles' },
            { to: '/permissions', label: 'Permissions' },
            { to: '/activity-logs', label: 'Activity Logs' },
            { to: '/login-history', label: 'Login History' },
        ],
    },
    {
        icon: '⚙️', label: 'System Settings',
        children: [
            { to: '/settings/barangay-profile', label: 'Barangay Profile' },
            { to: '/settings/certificate-templates', label: 'Certificate Templates' },
            { to: '/settings/backup-restore', label: 'Backup & Restore' },
            { to: '/settings/email-sms', label: 'Email/SMS Settings' },
            { to: '/settings/system-config', label: 'System Configuration' },
            { to: '/recycle-bin', label: 'Recycle Bin' },
        ],
    },
];
