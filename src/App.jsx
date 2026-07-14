import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';
import RequirePermission from './components/auth/RequirePermission.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ResidentsPage from './pages/ResidentsPage.jsx';
import HouseholdsPage from './pages/HouseholdsPage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import BlotterPage from './pages/BlotterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VotersPage from './pages/VotersPage.jsx';
import ResidentSearchPage from './pages/ResidentSearchPage.jsx';
import BusinessOwnersPage from './pages/BusinessOwnersPage.jsx';
import BusinessReportsPage from './pages/BusinessReportsPage.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';
import FinancialReportsPage from './pages/FinancialReportsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import PermissionsPage from './pages/PermissionsPage.jsx';
import LoginHistoryPage from './pages/LoginHistoryPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import DisasterReportsPage from './pages/DisasterReportsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import BarangayProfilePage from './pages/BarangayProfilePage.jsx';
import SettingsShellPage from './pages/SettingsShellPage.jsx';
import ResidentFormModal from './components/residents/ResidentFormModal.jsx';
import ResidentViewModal from './components/residents/ResidentViewModal.jsx';
import DeleteResidentModal from './components/residents/DeleteResidentModal.jsx';
import HouseholdFormModal from './components/households/HouseholdFormModal.jsx';
import HouseholdViewModal from './components/households/HouseholdViewModal.jsx';
import DeleteHouseholdModal from './components/households/DeleteHouseholdModal.jsx';
import CertificateFormModal from './components/certificates/CertificateFormModal.jsx';
import CertificateViewModal from './components/certificates/CertificateViewModal.jsx';
import DeleteCertificateModal from './components/certificates/DeleteCertificateModal.jsx';
import BlotterFormModal from './components/blotter/BlotterFormModal.jsx';
import BlotterViewModal from './components/blotter/BlotterViewModal.jsx';
import DeleteBlotterModal from './components/blotter/DeleteBlotterModal.jsx';
import ToastHost from './components/common/ToastHost.jsx';
import GenericPage from './components/generic/GenericPage.jsx';
import { genericRoutes } from './lib/genericRoutes.js';

export default function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <UIProvider>
                    <HashRouter>
                        <Routes>
                            <Route path="login" element={<LoginPage />} />
                            <Route
                                element={
                                    <RequireAuth>
                                        <AppLayout />
                                    </RequireAuth>
                                }
                            >
                                <Route index element={<DashboardPage />} />
                                <Route path="residents" element={<RequirePermission moduleKey="residents"><ResidentsPage /></RequirePermission>} />
                                <Route path="households" element={<RequirePermission moduleKey="households"><HouseholdsPage /></RequirePermission>} />
                                <Route path="certificates" element={<RequirePermission moduleKey="certificates"><CertificatesPage /></RequirePermission>} />
                                <Route path="blotter" element={<RequirePermission moduleKey="blotter"><BlotterPage /></RequirePermission>} />
                                <Route path="voters" element={<RequirePermission moduleKey="voters"><VotersPage /></RequirePermission>} />
                                <Route path="resident-search" element={<RequirePermission moduleKey="residentSearch"><ResidentSearchPage /></RequirePermission>} />
                                <Route path="business-owners" element={<RequirePermission moduleKey="businessOwners"><BusinessOwnersPage /></RequirePermission>} />
                                <Route path="business-reports" element={<RequirePermission moduleKey="businessReports"><BusinessReportsPage /></RequirePermission>} />
                                <Route path="audit-trail" element={<RequirePermission moduleKey="auditTrail"><AuditTrailPage /></RequirePermission>} />
                                <Route path="financial-reports" element={<RequirePermission moduleKey="financialReports"><FinancialReportsPage /></RequirePermission>} />
                                <Route path="users" element={<RequirePermission moduleKey="users"><UsersPage /></RequirePermission>} />
                                <Route path="permissions" element={<RequirePermission moduleKey="permissions"><PermissionsPage /></RequirePermission>} />
                                <Route path="activity-logs" element={<RequirePermission moduleKey="activityLogs"><AuditTrailPage /></RequirePermission>} />
                                <Route path="login-history" element={<RequirePermission moduleKey="loginHistory"><LoginHistoryPage /></RequirePermission>} />
                                <Route path="calendar" element={<RequirePermission moduleKey="calendar"><CalendarPage /></RequirePermission>} />
                                <Route path="disaster-reports" element={<RequirePermission moduleKey="disasterReports"><DisasterReportsPage /></RequirePermission>} />
                                <Route path="reports" element={<RequirePermission moduleKey="reports"><ReportsPage /></RequirePermission>} />
                                <Route path="settings/barangay-profile" element={<RequirePermission moduleKey="settings"><BarangayProfilePage /></RequirePermission>} />
                                <Route path="settings/backup-restore" element={<RequirePermission moduleKey="settings"><SettingsShellPage icon="💾" title="Backup & Restore" description="Not yet connected — automated backups need a storage/export target and credentials the team hasn't provided yet." /></RequirePermission>} />
                                <Route path="settings/email-sms" element={<RequirePermission moduleKey="settings"><SettingsShellPage icon="✉️" title="Email / SMS Settings" description="Not yet connected — sending real email/SMS needs a provider (e.g. Resend, Semaphore) and API credentials the team hasn't provided yet." /></RequirePermission>} />
                                <Route path="settings/system-config" element={<RequirePermission moduleKey="settings"><SettingsShellPage icon="⚙️" title="System Configuration" description="General system configuration options will appear here in a future update." /></RequirePermission>} />
                                <Route path="profile" element={<ProfilePage />} />
                                {genericRoutes.map((r) => (
                                    <Route key={r.path} path={r.path} element={<GenericPage config={r.config} />} />
                                ))}
                            </Route>
                        </Routes>
                    </HashRouter>

                    <ResidentFormModal />
                    <ResidentViewModal />
                    <DeleteResidentModal />
                    <HouseholdFormModal />
                    <HouseholdViewModal />
                    <DeleteHouseholdModal />
                    <CertificateFormModal />
                    <CertificateViewModal />
                    <DeleteCertificateModal />
                    <BlotterFormModal />
                    <BlotterViewModal />
                    <DeleteBlotterModal />
                    <ToastHost />
                </UIProvider>
            </DataProvider>
        </AuthProvider>
    );
}
