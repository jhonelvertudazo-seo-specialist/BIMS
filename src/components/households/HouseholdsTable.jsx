import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { openInMaps, downloadCsv } from '../../utils/actions.js';
import { formatDate } from '../../utils/format.js';

function handleMapGIS(household, showToast) {
    const query = [household.address, household.purok].filter(Boolean).join(', ');
    if (!openInMaps(query)) {
        showToast('No address on file for this household.', true);
    }
}

function handleGenerateReport(household) {
    downloadCsv(
        `${household.householdNo}-household-report.csv`,
        ['Household No.', 'Purok', 'Address', 'Head of Family', 'Family Members', 'Voter Members', 'PWD Members', 'Senior Members', 'Registered'],
        [[
            household.householdNo,
            household.purok,
            household.address || '',
            household.headOfFamily,
            household.familyMembersCount,
            household.voterMembersCount,
            household.pwdMembersCount,
            household.seniorMembersCount,
            formatDate(new Date(household.createdAt).toISOString()),
        ]]
    );
}

export default function HouseholdsTable({ households }) {
    const { openViewHousehold, openEditHousehold, openDeleteHousehold, showToast } = useUI();
    const { can } = useAuth();
    const canEdit = can('households', 'edit');
    const canDelete = can('households', 'delete');

    return (
        <table className="table table-hover align-middle mb-0 table-stack">
            <thead className="table-light">
                <tr>
                    <th>HH No.</th>
                    <th>Address (Purok)</th>
                    <th>Head of Family</th>
                    <th>Family Members</th>
                    <th>Voter Members</th>
                    <th>PWD Members</th>
                    <th>Senior Members</th>
                    <th className="text-end">Quick Actions</th>
                </tr>
            </thead>
            <tbody>
                {households.map((h) => (
                    <tr key={h.id}>
                        <td data-label="HH No."><span className="fw-semibold">{h.householdNo}</span></td>
                        <td data-label="Address (Purok)">{h.purok}{h.address ? ` — ${h.address}` : ''}</td>
                        <td data-label="Head of Family">{h.headOfFamily}</td>
                        <td data-label="Family Members">{h.familyMembersCount}</td>
                        <td data-label="Voter Members">{h.voterMembersCount}</td>
                        <td data-label="PWD Members">{h.pwdMembersCount}</td>
                        <td data-label="Senior Members">{h.seniorMembersCount}</td>
                        <td className="actions-cell text-end">
                            <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => openViewHousehold(h.id)}>👪 View Members</Dropdown.Item>
                                    {canEdit && <Dropdown.Item onClick={() => openEditHousehold(h.id)}>✏️ Update Info</Dropdown.Item>}
                                    <Dropdown.Item onClick={() => handleMapGIS(h, showToast)}>📍 Map GIS</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleGenerateReport(h)}>🖨️ Generate Report</Dropdown.Item>
                                    {canDelete && (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger" onClick={() => openDeleteHousehold(h.id)}>🗑️ Delete</Dropdown.Item>
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
