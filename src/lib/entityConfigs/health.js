import { findLookupLabel } from '../genericDisplay.js';
import { formatDate } from '../../utils/format.js';

const residentLookup = [{ key: 'residents', source: 'context' }];
const residentField = { key: 'residentId', label: 'Resident', type: 'lookup', lookup: 'residents', displayField: 'fullName', column: 'resident_id', required: true, col: 'col-12' };
const residentColumn = { label: 'Resident', render: (item, l) => findLookupLabel(l, 'residents', item.residentId, 'fullName') || '—' };

export const healthRecordsConfig = {
    key: 'healthRecords',
    table: 'health_records',
    title: 'Health Record',
    subtitle: 'Resident medical background',
    addLabel: '+ Add Health Record',
    emptyIcon: '🏥',
    orderBy: { column: 'created_at', ascending: true },
    lookups: residentLookup,
    fields: [
        residentField,
        { key: 'bloodType', label: 'Blood Type', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
        { key: 'allergies', label: 'Allergies', type: 'textarea' },
        { key: 'medicalHistory', label: 'Medical History', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['bloodType', 'allergies'],
    columns: [
        residentColumn,
        { label: 'Blood Type', render: (item) => item.bloodType || '—' },
        { label: 'Allergies', render: (item) => item.allergies || '—' },
    ],
    deleteLabel: () => 'this health record',
};

export const vaccinationsConfig = {
    key: 'vaccinations',
    table: 'vaccinations',
    title: 'Vaccination',
    subtitle: 'Vaccination records per resident',
    addLabel: '+ Add Vaccination Record',
    emptyIcon: '💉',
    orderBy: { column: 'created_at', ascending: true },
    lookups: residentLookup,
    fields: [
        residentField,
        { key: 'vaccineName', label: 'Vaccine Name', type: 'text', required: true },
        { key: 'dose', label: 'Dose', type: 'select', options: ['1st Dose', '2nd Dose', '3rd Dose', 'Booster'] },
        { key: 'dateVaccinated', label: 'Date Vaccinated', type: 'date' },
        { key: 'healthWorker', label: 'Health Worker', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['vaccineName', 'healthWorker'],
    columns: [
        residentColumn,
        { label: 'Vaccine', render: (item) => item.vaccineName || '—' },
        { label: 'Dose', render: (item) => item.dose || '—' },
        { label: 'Date', render: (item) => (item.dateVaccinated ? formatDate(item.dateVaccinated) : '—') },
    ],
    deleteLabel: (item) => item.vaccineName || 'this vaccination record',
};

export const prenatalRecordsConfig = {
    key: 'prenatalCare',
    table: 'prenatal_records',
    title: 'Prenatal Care',
    subtitle: 'Prenatal check-up tracking',
    addLabel: '+ Add Prenatal Record',
    emptyIcon: '🤰',
    orderBy: { column: 'created_at', ascending: true },
    lookups: residentLookup,
    fields: [
        residentField,
        { key: 'lmpDate', label: 'Last Menstrual Period', type: 'date' },
        { key: 'edcDate', label: 'Expected Date of Confinement', type: 'date' },
        { key: 'trimester', label: 'Trimester', type: 'select', options: ['1st Trimester', '2nd Trimester', '3rd Trimester'] },
        { key: 'prenatalVisits', label: 'Prenatal Visits', type: 'number' },
        { key: 'healthWorker', label: 'Health Worker', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['trimester', 'healthWorker'],
    columns: [
        residentColumn,
        { label: 'Trimester', render: (item) => item.trimester || '—' },
        { label: 'EDC', render: (item) => (item.edcDate ? formatDate(item.edcDate) : '—') },
        { label: 'Visits', render: (item) => item.prenatalVisits || 0 },
    ],
    deleteLabel: () => 'this prenatal record',
};

export const medicalAssistanceConfig = {
    key: 'medicalAssistance',
    table: 'medical_assistance',
    title: 'Medical Assistance',
    subtitle: 'Medicine and medical aid given to residents',
    addLabel: '+ Record Medical Assistance',
    emptyIcon: '🩺',
    orderBy: { column: 'created_at', ascending: true },
    lookups: residentLookup,
    fields: [
        residentField,
        { key: 'assistanceType', label: 'Assistance Type', type: 'select', options: ['Medicine', 'Financial Aid', 'Referral', 'Check-up'] },
        { key: 'medicineGiven', label: 'Medicine Given', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'healthWorker', label: 'Health Worker', type: 'text' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', col: 'col-12' },
    ],
    searchFields: ['assistanceType', 'medicineGiven'],
    columns: [
        residentColumn,
        { label: 'Type', render: (item) => item.assistanceType || '—' },
        { label: 'Medicine Given', render: (item) => item.medicineGiven || '—' },
        { label: 'Date', render: (item) => (item.date ? formatDate(item.date) : '—') },
    ],
    deleteLabel: () => 'this medical assistance record',
};

export const medicinesConfig = {
    key: 'medicineInventory',
    table: 'medicines',
    title: 'Medicine',
    subtitle: 'Barangay health station medicine stock',
    addLabel: '+ Add Medicine',
    emptyIcon: '💊',
    orderBy: { column: 'created_at', ascending: true },
    fields: [
        { key: 'itemName', label: 'Medicine Name', type: 'text', required: true },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g. tablet, bottle' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
        { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
    ],
    searchFields: ['itemName', 'category'],
    stats: [
        { label: 'Total Items', icon: '💊', compute: (items) => items.length },
        { label: 'Low Stock', icon: '⚠️', compute: (items) => items.filter((i) => Number(i.quantity) <= Number(i.reorderLevel)).length },
    ],
    columns: [
        { label: 'Medicine', render: (item) => item.itemName },
        { label: 'Category', render: (item) => item.category || '—' },
        { label: 'Quantity', render: (item) => `${item.quantity || 0} ${item.unit || ''}`.trim() },
        { label: 'Expiry', render: (item) => (item.expiryDate ? formatDate(item.expiryDate) : '—') },
    ],
    deleteLabel: (item) => item.itemName,
};
