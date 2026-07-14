import { Dropdown } from 'react-bootstrap';

export default function GenericTable({ config, items, lookupData, onView, onEdit, onDelete, extraActions, canEdit = true, canDelete = true }) {
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
                    <tr key={item.id}>
                        {config.columns.map((col) => (
                            <td key={col.label} data-label={col.label}>{col.render(item, lookupData)}</td>
                        ))}
                        <td className="actions-cell text-end">
                            <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {config.hasView !== false && (
                                        <Dropdown.Item onClick={() => onView(item.id)}>👁️ View</Dropdown.Item>
                                    )}
                                    {canEdit && <Dropdown.Item onClick={() => onEdit(item.id)}>✏️ Edit</Dropdown.Item>}
                                    {extraActions && extraActions(item)}
                                    {canDelete && (
                                        <>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="text-danger" onClick={() => onDelete(item.id)}>🗑️ Delete</Dropdown.Item>
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
