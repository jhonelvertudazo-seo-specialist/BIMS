import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate } from '../../utils/format.js';
import { printDocument } from '../../utils/actions.js';
import StatusPill from '../common/StatusPill.jsx';

function handlePrint(blotter) {
    printDocument(`Blotter — ${blotter.caseNo}`, `
        <h1>Blotter Record</h1>
        <h2>Barangay Information and Management System</h2>
        <table>
            <tr><td class="label">Case No.</td><td class="value">${blotter.caseNo}</td></tr>
            <tr><td class="label">Date Filed</td><td class="value">${formatDate(blotter.incidentDate)}</td></tr>
            <tr><td class="label">Complainant</td><td class="value">${blotter.complainant}</td></tr>
            <tr><td class="label">Respondent</td><td class="value">${blotter.respondent}</td></tr>
            <tr><td class="label">Incident Type</td><td class="value">${blotter.incidentType}</td></tr>
            <tr><td class="label">Status</td><td class="value">${blotter.status}</td></tr>
            <tr><td class="label">Details</td><td class="value">${blotter.details || '—'}</td></tr>
        </table>
        <div class="sign-line"><div class="line">Barangay Official Signature</div></div>
    `);
}

export default function BlotterTable({ blotters, settlingId, onSettle, canEdit = true, canDelete = true }) {
    const { openViewBlotter, openDeleteBlotter } = useUI();

    return (
        <table className="table table-hover align-middle mb-0 table-stack">
            <thead className="table-light">
                <tr>
                    <th>Case No.</th>
                    <th>Date</th>
                    <th>Complainant</th>
                    <th>Respondent</th>
                    <th>Incident Type</th>
                    <th>Status</th>
                    <th className="text-end">Quick Actions</th>
                </tr>
            </thead>
            <tbody>
                {blotters.map((b) => (
                    <tr key={b.id}>
                        <td data-label="Case No.">{b.caseNo}</td>
                        <td data-label="Date">{formatDate(b.incidentDate)}</td>
                        <td data-label="Complainant">{b.complainant}</td>
                        <td data-label="Respondent">{b.respondent}</td>
                        <td data-label="Incident Type">{b.incidentType}</td>
                        <td data-label="Status"><StatusPill status={b.status} /></td>
                        <td className="actions-cell text-end">
                            <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary" disabled={settlingId === b.id}>
                                    {settlingId === b.id ? 'Saving…' : 'Actions'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => openViewBlotter(b.id)}>👁️ View Details</Dropdown.Item>
                                    {canEdit && b.status === 'Active' && (
                                        <Dropdown.Item onClick={() => onSettle(b.id)}>✅ Mark Settled</Dropdown.Item>
                                    )}
                                    <Dropdown.Item onClick={() => handlePrint(b)}>🖨️ Print</Dropdown.Item>
                                    {canDelete && (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger" onClick={() => openDeleteBlotter(b.id)}>🗑️ Delete</Dropdown.Item>
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
