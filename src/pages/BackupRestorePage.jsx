import { useCallback, useEffect, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadCsv } from '../utils/actions.js';
import { formatDate, formatFileSize } from '../utils/format.js';
import { runDatabaseBackup, listDatabaseBackups, downloadDatabaseBackup } from '../lib/backup.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

function formatWhen(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function BackupRestorePage() {
    const { residents, households, certificates, blotters } = useData();
    const { user, isAdmin } = useAuth();

    const [backups, setBackups] = useState([]);
    const [backupsLoading, setBackupsLoading] = useState(isAdmin);
    const [running, setRunning] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [toast, setToast] = useState('');

    const loadBackups = useCallback(async () => {
        if (!isAdmin) return;
        setBackupsLoading(true);
        try {
            setBackups(await listDatabaseBackups());
        } catch (err) {
            console.error('Failed to load backups:', err.message);
        } finally {
            setBackupsLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => { loadBackups(); }, [loadBackups]);

    async function handleRunBackup() {
        setRunning(true);
        try {
            const record = await runDatabaseBackup({ residents, households, certificates, blotters }, user?.email);
            setBackups((prev) => [record, ...prev]);
            setToast('Backup created successfully.');
        } catch (err) {
            setToast(err.message || 'Failed to create backup.');
        } finally {
            setRunning(false);
        }
    }

    async function handleDownload(backup) {
        setDownloadingId(backup.id);
        try {
            await downloadDatabaseBackup(backup.file_path, backup.file_name);
        } catch (err) {
            setToast(err.message || 'Failed to download backup.');
        } finally {
            setDownloadingId(null);
        }
    }

    function exportResidents() {
        downloadCsv(
            'residents-backup.csv',
            ['Resident ID', 'Full Name', 'Gender', 'Birth Date', 'Purok', 'Address', 'Civil Status', 'Sector', 'Contact', 'Registered Voter'],
            residents.map((r) => [r.residentId, r.fullName, r.gender, r.birthDate || '', r.purok, r.address || '', r.civilStatus, r.sector, r.contact || '', r.registeredVoter ? 'Yes' : 'No'])
        );
    }

    function exportHouseholds() {
        downloadCsv(
            'households-backup.csv',
            ['Household No.', 'Purok', 'Address', 'Head of Family', 'Family Members', 'Voter Members', 'PWD Members', 'Senior Members'],
            households.map((h) => [h.householdNo, h.purok, h.address || '', h.headOfFamily, h.familyMembersCount, h.voterMembersCount, h.pwdMembersCount, h.seniorMembersCount])
        );
    }

    function exportCertificates() {
        downloadCsv(
            'certificates-backup.csv',
            ['Date', 'Type', 'Resident', 'Purpose', 'Fee', 'Reference No.'],
            certificates.map((c) => [formatDate(new Date(c.issuedAt).toISOString()), c.type, c.residentName, c.purpose || '', c.fee, c.referenceNo])
        );
    }

    function exportBlotters() {
        downloadCsv(
            'blotter-backup.csv',
            ['Case No.', 'Date', 'Complainant', 'Respondent', 'Incident Type', 'Status'],
            blotters.map((b) => [b.caseNo, formatDate(b.incidentDate), b.complainant, b.respondent, b.incidentType, b.status])
        );
    }

    function exportAll() {
        exportResidents();
        exportHouseholds();
        exportCertificates();
        exportBlotters();
    }

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Backup &amp; Restore</h5>
                    <p className="text-muted small mb-0">How to keep this data safe, and how to get it back if something goes wrong</p>
                </div>
                <div className="card-body">
                    <div className="alert alert-info small mb-4">
                        BIMS stores all data in Supabase (Postgres). There is no one-click &quot;Restore&quot; button in the
                        app itself — restoring a database is a destructive operation that has to happen at the
                        database level, not from the browser.
                    </div>

                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Quick in-app export</h6>
                    <p className="text-muted small">
                        For a fast, no-CLI-required snapshot of the core records (not a substitute for the full
                        database backup above, but useful for spot-checks or an extra offline copy), export the
                        data already loaded in BIMS as CSV files:
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportResidents}>📤 Export Residents ({residents.length})</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportHouseholds}>📤 Export Households ({households.length})</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportCertificates}>📤 Export Certificates ({certificates.length})</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportBlotters}>📤 Export Blotter Records ({blotters.length})</button>
                        <button type="button" className="btn btn-accent btn-sm" onClick={exportAll}>📤 Export All Four</button>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
                            <div>
                                <h5 className="mb-0">Automatic Backup to Supabase</h5>
                                <p className="text-muted small mb-0">
                                    Snapshots Residents, Households, Certificates, and Blotter Records into one JSON
                                    file, uploaded to a private Supabase Storage bucket and logged below.
                                </p>
                            </div>
                            <button type="button" className="btn btn-accent text-nowrap" onClick={handleRunBackup} disabled={running}>
                                {running ? 'Backing up…' : '🗄️ Backup Now'}
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {toast && (
                            <div className="alert alert-info py-2 small d-flex justify-content-between align-items-center">
                                <span>{toast}</span>
                                <button type="button" className="btn-close" onClick={() => setToast('')} aria-label="Close"></button>
                            </div>
                        )}
                        {backupsLoading ? (
                            <LoadingSpinner label="Loading backups…" />
                        ) : backups.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <p className="fs-1 mb-2">🗄️</p>
                                <p className="fs-5">No backups yet.</p>
                                <p>Click &quot;Backup Now&quot; to create the first one.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 table-stack">
                                    <thead className="table-light">
                                        <tr>
                                            <th>File</th>
                                            <th>Created</th>
                                            <th>By</th>
                                            <th>Records</th>
                                            <th>Size</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((b) => (
                                            <tr key={b.id}>
                                                <td data-label="File">{b.file_name}</td>
                                                <td data-label="Created">{formatWhen(b.created_at)}</td>
                                                <td data-label="By">{b.created_by || '—'}</td>
                                                <td data-label="Records">
                                                    {Object.values(b.record_counts || {}).reduce((sum, n) => sum + (Number(n) || 0), 0)}
                                                </td>
                                                <td data-label="Size">{formatFileSize(b.size_bytes)}</td>
                                                <td className="actions-cell text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => handleDownload(b)}
                                                        disabled={downloadingId === b.id}
                                                    >
                                                        {downloadingId === b.id ? 'Preparing…' : '⬇ Download'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
