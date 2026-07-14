import { findLookupLabel } from '../genericDisplay.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

export const suppliersConfig = {
    key: 'suppliers',
    permissionKey: 'supplies',
    table: 'suppliers',
    title: 'Supplier',
    subtitle: 'Suppliers used for barangay supplies',
    addLabel: '+ Add Supplier',
    emptyIcon: '🚚',
    hasView: false,
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'name', label: 'Supplier Name', type: 'text', required: true },
        { key: 'contact', label: 'Contact', type: 'text' },
        { key: 'address', label: 'Address', type: 'text', col: 'col-12' },
    ],
    searchFields: ['name', 'contact'],
    columns: [
        { label: 'Supplier Name', render: (item) => item.name },
        { label: 'Contact', render: (item) => item.contact || '—' },
        { label: 'Address', render: (item) => item.address || '—' },
    ],
    deleteLabel: (item) => item.name,
};

export const assetsConfig = {
    key: 'assets',
    table: 'assets',
    title: 'Equipment / Asset',
    subtitle: 'Barangay equipment and asset registry',
    addLabel: '+ Add Asset',
    emptyIcon: '📦',
    orderBy: { column: 'created_at', ascending: true },
    codeField: 'barcode',
    codePrefix: 'AST-',
    codePattern: /AST-(\d+)/,
    codePadLength: 5,
    fields: [
        { key: 'barcode', label: 'Barcode', type: 'text', auto: true },
        { key: 'assetName', label: 'Asset Name', type: 'text', required: true },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'brand', label: 'Brand', type: 'text' },
        { key: 'model', label: 'Model', type: 'text' },
        { key: 'serialNumber', label: 'Serial Number', type: 'text' },
        { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
        { key: 'purchaseCost', label: 'Purchase Cost', type: 'currency' },
        { key: 'assignedTo', label: 'Assigned To', type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'condition', label: 'Condition', type: 'select', options: ['Good', 'Fair', 'Needs Repair', 'Damaged'] },
        { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Assigned', 'Under Maintenance', 'Retired'] },
    ],
    searchFields: ['assetName', 'category', 'serialNumber', 'assignedTo'],
    filters: [
        { key: 'status', label: 'Status: All', field: 'status', options: ['Available', 'Assigned', 'Under Maintenance', 'Retired'] },
    ],
    stats: [
        { label: 'Total Assets', icon: '📦', compute: (items) => items.length },
        { label: 'Assigned', icon: '👤', compute: (items) => items.filter((i) => i.status === 'Assigned').length },
    ],
    columns: [
        { label: 'Barcode', render: (item) => item.barcode || '—' },
        { label: 'Asset Name', render: (item) => item.assetName },
        { label: 'Category', render: (item) => item.category || '—' },
        { label: 'Assigned To', render: (item) => item.assignedTo || '—' },
        { label: 'Status', render: (item) => item.status || '—' },
    ],
    deleteLabel: (item) => item.assetName,
};

export const assetAssignmentConfig = {
    ...assetsConfig,
    key: 'assetAssignment',
    permissionKey: 'assets',
    title: 'Asset Assignment',
    subtitle: 'Assets currently assigned to staff or offices',
    addLabel: '+ Add Asset',
    filterItems: (items) => items.filter((i) => i.status === 'Assigned' || !!i.assignedTo),
};

export const suppliesConfig = {
    key: 'supplies',
    table: 'supplies',
    title: 'Supply',
    subtitle: 'Office and operational supplies inventory',
    addLabel: '+ Add Supply',
    emptyIcon: '🧰',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [{ key: 'suppliers', source: 'table', table: 'suppliers' }],
    fields: [
        { key: 'itemName', label: 'Item Name', type: 'text', required: true },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'unit', label: 'Unit', type: 'text' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
        { key: 'supplierId', label: 'Supplier', type: 'lookup', lookup: 'suppliers', displayField: 'name', column: 'supplier_id' },
    ],
    searchFields: ['itemName', 'category'],
    stats: [
        { label: 'Total Items', icon: '🧰', compute: (items) => items.length },
        { label: 'Low Stock', icon: '⚠️', compute: (items) => items.filter((i) => Number(i.quantity) <= Number(i.reorderLevel)).length },
    ],
    columns: [
        { label: 'Item Name', render: (item) => item.itemName },
        { label: 'Category', render: (item) => item.category || '—' },
        { label: 'Quantity', render: (item) => `${item.quantity || 0} ${item.unit || ''}`.trim() },
        { label: 'Supplier', render: (item, l) => findLookupLabel(l, 'suppliers', item.supplierId, 'name') || '—' },
    ],
    deleteLabel: (item) => item.itemName,
};

export const maintenanceConfig = {
    key: 'maintenance',
    table: 'maintenance_records',
    title: 'Maintenance Record',
    subtitle: 'Maintenance history for barangay assets',
    addLabel: '+ Log Maintenance',
    emptyIcon: '🛠️',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [{ key: 'assets', source: 'table', table: 'assets' }],
    fields: [
        { key: 'assetId', label: 'Asset', type: 'lookup', lookup: 'assets', displayField: 'asset_name', column: 'asset_id', required: true, col: 'col-12' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
        { key: 'cost', label: 'Cost', type: 'currency' },
        { key: 'performedBy', label: 'Performed By', type: 'text' },
    ],
    searchFields: ['description', 'performedBy'],
    columns: [
        { label: 'Asset', render: (item, l) => findLookupLabel(l, 'assets', item.assetId, 'asset_name') || '—' },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
        { label: 'Description', render: (item) => item.description || '—' },
        { label: 'Cost', render: (item) => formatCurrency(item.cost) },
    ],
    deleteLabel: () => 'this maintenance record',
};
