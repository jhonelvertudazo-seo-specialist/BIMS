import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';

export const evacuationCentersConfig = {
    key: 'evacuationCenters',
    table: 'evacuation_centers',
    title: 'Evacuation Center',
    subtitle: 'Designated evacuation sites and current occupancy',
    addLabel: '+ Add Evacuation Center',
    emptyIcon: '⛺',
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'name', label: 'Center Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text', col: 'col-12' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { key: 'currentOccupancy', label: 'Current Occupancy', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['Available', 'In Use', 'Full', 'Closed'] },
    ],
    searchFields: ['name', 'address'],
    columns: [
        { label: 'Center Name', render: (item) => item.name },
        { label: 'Capacity', render: (item) => item.capacity || 0 },
        { label: 'Occupancy', render: (item) => item.currentOccupancy || 0 },
        { label: 'Status', render: (item) => item.status || '—' },
    ],
    deleteLabel: (item) => item.name,
};

export const disasterIncidentsConfig = {
    key: 'disasterIncidents',
    table: 'disaster_incidents',
    title: 'Disaster Incident',
    subtitle: 'Logged disaster and emergency incidents',
    addLabel: '+ Log Disaster Incident',
    emptyIcon: '🚨',
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'disasterType', label: 'Disaster Type', type: 'select', required: true, options: ['Flood', 'Fire', 'Typhoon', 'Earthquake', 'Landslide', 'Other'] },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 14:30' },
        { key: 'location', label: 'Location', type: 'text', col: 'col-12' },
        { key: 'familiesAffected', label: 'Families Affected', type: 'number' },
        { key: 'residentsAffected', label: 'Residents Affected', type: 'number' },
        { key: 'casualties', label: 'Casualties', type: 'number' },
        { key: 'officerInCharge', label: 'Officer in Charge', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['disasterType', 'location', 'officerInCharge'],
    stats: [
        { label: 'Total Incidents', icon: '🚨', compute: (items) => items.length },
        { label: 'Residents Affected', icon: '👥', compute: (items) => items.reduce((s, i) => s + (Number(i.residentsAffected) || 0), 0) },
    ],
    columns: [
        { label: 'Type', render: (item) => item.disasterType || '—' },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
        { label: 'Location', render: (item) => item.location || '—' },
        { label: 'Families Affected', render: (item) => item.familiesAffected || 0 },
        { label: 'Officer in Charge', render: (item) => item.officerInCharge || '—' },
    ],
    deleteLabel: (item) => `${item.disasterType} (${item.date || ''})`,
};

export const reliefDistributionsConfig = {
    key: 'reliefDistribution',
    table: 'relief_distributions',
    title: 'Relief Distribution',
    subtitle: 'Relief goods released per household',
    addLabel: '+ Record Relief Distribution',
    emptyIcon: '📦',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [
        { key: 'households', source: 'context' },
        { key: 'disasterIncidents', source: 'table', table: 'disaster_incidents' },
    ],
    fields: [
        { key: 'incidentId', label: 'Disaster Incident', type: 'lookup', lookup: 'disasterIncidents', displayField: 'disaster_type', column: 'incident_id', col: 'col-12 col-md-6' },
        { key: 'householdId', label: 'Household', type: 'lookup', lookup: 'households', displayField: 'householdNo', column: 'household_id', required: true, col: 'col-12 col-md-6' },
        { key: 'reliefGoods', label: 'Relief Goods', type: 'textarea', col: 'col-12' },
        { key: 'date', label: 'Date Released', type: 'date' },
        { key: 'releasedBy', label: 'Released By', type: 'text' },
    ],
    searchFields: ['reliefGoods', 'releasedBy'],
    columns: [
        { label: 'Household', render: (item, l) => findLookupLabel(l, 'households', item.householdId, 'householdNo') || '—' },
        { label: 'Relief Goods', render: (item) => item.reliefGoods || '—' },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
        { label: 'Released By', render: (item) => item.releasedBy || '—' },
    ],
    deleteLabel: () => 'this relief distribution record',
};

export const rescueOperationsConfig = {
    key: 'rescueOperations',
    table: 'rescue_operations',
    title: 'Rescue Operation',
    subtitle: 'Rescue teams dispatched per incident',
    addLabel: '+ Log Rescue Operation',
    emptyIcon: '🚑',
    orderBy: { column: 'created_at', ascending: true },
    lookups: [{ key: 'disasterIncidents', source: 'table', table: 'disaster_incidents' }],
    fields: [
        { key: 'incidentId', label: 'Disaster Incident', type: 'lookup', lookup: 'disasterIncidents', displayField: 'disaster_type', column: 'incident_id', col: 'col-12' },
        { key: 'team', label: 'Rescue Team', type: 'text', required: true },
        { key: 'details', label: 'Operation Details', type: 'textarea', col: 'col-12' },
        { key: 'date', label: 'Date', type: 'date' },
    ],
    searchFields: ['team', 'details'],
    columns: [
        { label: 'Team', render: (item) => item.team },
        { label: 'Incident', render: (item, l) => findLookupLabel(l, 'disasterIncidents', item.incidentId, 'disaster_type') || '—' },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
    ],
    deleteLabel: (item) => item.team,
};
