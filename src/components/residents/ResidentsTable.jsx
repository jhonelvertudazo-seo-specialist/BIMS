import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatCurrency, initials } from '../../utils/format.js';
import SectorBadge from '../common/SectorBadge.jsx';
import { openInMaps, printDocument } from '../../utils/actions.js';
import { generateBarcodeDataUrl } from '../../utils/barcode.js';

function handleContact(resident, showToast) {
    if (resident.contact) {
        window.location.href = `tel:${resident.contact}`;
    } else {
        showToast('No contact number on file for this resident.', true);
    }
}

function handleMapGIS(resident, showToast) {
    const query = [resident.address, resident.purok].filter(Boolean).join(', ');
    if (!openInMaps(query)) {
        showToast('No address on file for this resident.', true);
    }
}

function handlePrint(resident) {
    printDocument(`Resident Profile — ${resident.residentId}`, `
        <h1>Resident Profile</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            <tr><td class="label">Resident ID</td><td class="value">${resident.residentId}</td></tr>
            <tr><td class="label">Full Name</td><td class="value">${resident.fullName}</td></tr>
            <tr><td class="label">Gender</td><td class="value">${resident.gender || '—'}</td></tr>
            <tr><td class="label">Birth Date</td><td class="value">${resident.birthDate ? formatDate(resident.birthDate) : '—'}</td></tr>
            <tr><td class="label">Address</td><td class="value">${resident.purok || ''}${resident.address ? ` — ${resident.address}` : ''}</td></tr>
            <tr><td class="label">Civil Status</td><td class="value">${resident.civilStatus || '—'}</td></tr>
            <tr><td class="label">Sector</td><td class="value">${resident.sector || '—'}</td></tr>
            <tr><td class="label">Occupation</td><td class="value">${resident.occupation || '—'}</td></tr>
            <tr><td class="label">Employment Status</td><td class="value">${resident.employmentStatus || '—'}</td></tr>
            <tr><td class="label">Monthly Income</td><td class="value">${resident.monthlyIncome ? formatCurrency(resident.monthlyIncome) : '—'}</td></tr>
            <tr><td class="label">Contact Number</td><td class="value">${resident.contact || '—'}</td></tr>
            <tr><td class="label">Registered Voter</td><td class="value">${resident.registeredVoter ? 'Yes' : 'No'}</td></tr>
        </table>
        ${(() => {
            const barcode = generateBarcodeDataUrl(resident.residentId);
            return barcode ? `<div style="text-align:center;margin-top:1rem;"><img src="${barcode}" alt="Barcode ${resident.residentId}" style="height:45px;" /></div>` : '';
        })()}
    `);
}

export default function ResidentsTable({ residents }) {
    const { openViewResident, openEditResident, openDeleteResident, showToast } = useUI();
    const { can } = useAuth();
    const canEdit = can('residents', 'edit');
    const canDelete = can('residents', 'delete');

    return (
        <table className="table table-hover align-middle mb-0 table-stack">
            <thead className="table-light">
                <tr>
                    <th>Resident ID</th>
                    <th>Photo</th>
                    <th>Full Name</th>
                    <th>Gender</th>
                    <th>Birth Date</th>
                    <th>Address (Purok)</th>
                    <th>Civil Status</th>
                    <th>Sector</th>
                    <th>Occupation</th>
                    <th>Employment Status</th>
                    <th className="text-end">Quick Actions</th>
                </tr>
            </thead>
            <tbody>
                {residents.map((r) => (
                    <tr key={r.id}>
                        <td data-label="Resident ID"><span className="fw-semibold">{r.residentId}</span></td>
                        <td data-label="Photo">
                            {r.photoUrl ? (
                                <img src={r.photoUrl} alt={r.fullName} className="resident-avatar" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="resident-avatar">{initials(r.fullName)}</div>
                            )}
                        </td>
                        <td data-label="Full Name">{r.fullName}</td>
                        <td data-label="Gender">{r.gender}</td>
                        <td data-label="Birth Date">{formatDate(r.birthDate)}</td>
                        <td data-label="Address (Purok)">{r.purok}{r.address ? ` — ${r.address}` : ''}</td>
                        <td data-label="Civil Status">{r.civilStatus}</td>
                        <td data-label="Sector"><SectorBadge sector={r.sector} /></td>
                        <td data-label="Occupation">{r.occupation || '—'}</td>
                        <td data-label="Employment Status">{r.employmentStatus || '—'}</td>
                        <td className="actions-cell text-end">
                            <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => openViewResident(r.id)}>👁️ View Details</Dropdown.Item>
                                    {canEdit && <Dropdown.Item onClick={() => openEditResident(r.id)}>✏️ Edit Profile</Dropdown.Item>}
                                    <Dropdown.Item onClick={() => handleContact(r, showToast)}>📞 Contact</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleMapGIS(r, showToast)}>📍 Map GIS</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handlePrint(r)}>🖨️ Print</Dropdown.Item>
                                    {canDelete && (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger" onClick={() => openDeleteResident(r.id)}>🗑️ Delete</Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
