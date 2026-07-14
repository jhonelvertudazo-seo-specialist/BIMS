import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { formatDate } from '../../utils/format.js';
import StatusPill from '../common/StatusPill.jsx';

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
