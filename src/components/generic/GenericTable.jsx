import { Dropdown } from 'react-bootstrap';
import { printGenericRecord } from '../../utils/printRecord.js';

export default function GenericTable({
    config, items, lookupData, onView, onEdit, onDelete, onRegister, residentFieldKey,
    extraActions, canEdit = true, canDelete = true, canAdd = true,
}) {
    return (
        <table className="table table-hover align-middle mb-0 table-stack">
            <thead className="table-light">
                <tr>
                    {config.columns.map((col) => <th key={col.label}>{col.label}</th>)}
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id} className={item.__candidate ? 'table-warning' : ''}>
                        {config.columns.map((col, i) => (
                            <td key={col.label} data-label={col.label}>
                                {item.__candidate && i === 0 ? (
                                    <span className="badge bg-warning-subtle text-warning-emphasis me-2">Not Registered</span>
                                ) : null}
                                {col.render(item, lookupData)}
                            </td>
                        ))}
                        <td className="actions-cell text-end">
                            {item.__candidate ? (
                                canAdd && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => onRegister(item[residentFieldKey])}
                                    >
                                        + Register
                                    </button>
                                )
                            ) : (
                                <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                    <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {config.hasView !== false && (
                                            <Dropdown.Item onClick={() => onView(item.id)}>👁️ View</Dropdown.Item>
                                        )}
                                        {canEdit && <Dropdown.Item onClick={() => onEdit(item.id)}>✏️ Edit</Dropdown.Item>}
                                        <Dropdown.Item onClick={() => printGenericRecord(config, item, lookupData)}>🖨️ Print</Dropdown.Item>
                                        {extraActions && extraActions(item)}
                                        {canDelete && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Item className="text-danger" onClick={() => onDelete(item.id)}>🗑️ Delete</Dropdown.Item>
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
