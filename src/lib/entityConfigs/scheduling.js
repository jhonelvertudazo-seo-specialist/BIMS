import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';

const eventFields = [
    { key: 'eventName', label: 'Event Name', type: 'text', required: true, col: 'col-12' },
    { key: 'eventType', label: 'Event Type', type: 'select', options: ['Event', 'Session'], required: true },
    { key: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
    { key: 'date', label: 'Date', type: 'date', required: true },
    { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 09:00 AM' },
    { key: 'venue', label: 'Venue', type: 'text' },
    { key: 'organizer', label: 'Organizer', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'] },
];

const eventColumns = [
    { label: 'Event Name', render: (item) => item.eventName },
    { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
    { label: 'Venue', render: (item) => item.venue || '—' },
    { label: 'Organizer', render: (item) => item.organizer || '—' },
    { label: 'Status', render: (item) => item.status || '—' },
];

const sharedEvent = {
    table: 'events',
    emptyIcon: '🗓️',
    orderBy: { column: 'date', ascending: true },
    fields: eventFields,
    searchFields: ['eventName', 'venue', 'organizer'],
    columns: eventColumns,
    deleteLabel: (item) => item.eventName,
};

export const eventsConfig = {
    ...sharedEvent,
    key: 'events',
    title: 'Event',
    subtitle: 'Barangay events and activities',
    addLabel: '+ Add Event',
    filterItems: (items) => items.filter((i) => i.eventType !== 'Session'),
};

export const barangaySessionsConfig = {
    ...sharedEvent,
    key: 'barangaySessions',
    permissionKey: 'events',
    title: 'Barangay Session',
    subtitle: 'Regular barangay council sessions',
    addLabel: '+ Add Session',
    filterItems: (items) => items.filter((i) => i.eventType === 'Session'),
};

export const appointmentsConfig = {
    key: 'appointments',
    table: 'appointments',
    title: 'Appointment',
    subtitle: 'Resident appointments with barangay officials',
    addLabel: '+ Add Appointment',
    emptyIcon: '📅',
    orderBy: { column: 'date', ascending: true },
    lookups: [{ key: 'residents', source: 'context' }],
    fields: [
        { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' },
        { key: 'purpose', label: 'Purpose', type: 'text', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 10:00 AM' },
        { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled', 'No Show'] },
    ],
    searchFields: ['purpose'],
    columns: [
        { label: 'Resident', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' },
        { label: 'Purpose', render: (item) => item.purpose },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
        { label: 'Time', render: (item) => item.time || '—' },
        { label: 'Status', render: (item) => item.status || '—' },
    ],
    deleteLabel: (item) => item.purpose,
};
