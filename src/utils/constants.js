export const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];

export const SECTORS = ['Regular Resident', 'Senior Citizen', 'PWD', 'Solo Parent', 'OFW'];

export const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated'];

export const EMPLOYMENT_STATUSES = ['Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired'];

export const EDUCATIONAL_ATTAINMENTS = [
    'None', 'Elementary Undergraduate', 'Elementary Graduate',
    'High School Undergraduate', 'High School Graduate',
    'College Undergraduate', 'College Graduate', 'Vocational', 'Post Graduate',
];

export const RESIDENT_STATUSES = ['Active', 'Inactive'];

export const CERTIFICATE_TYPES = [
    { type: 'Barangay Clearance', fee: 50 },
    { type: 'Certificate of Residency', fee: 30 },
    { type: 'Certificate of Indigency', fee: 0 },
    { type: 'Certificate of Good Moral Character', fee: 30 },
    { type: 'Business Permit Endorsement', fee: 100 },
];

export const INCIDENT_TYPES = ['Noise Complaint', 'Property Dispute', 'Physical Altercation', 'Theft', 'Verbal Altercation', 'Other'];

export function sectorBadgeClass(sector) {
    switch (sector) {
        case 'Senior Citizen': return 'bg-warning-subtle text-warning-emphasis';
        case 'PWD': return 'bg-info-subtle text-info-emphasis';
        case 'Solo Parent': return 'bg-success-subtle text-success-emphasis';
        case 'OFW': return 'bg-primary-subtle text-primary-emphasis';
        default: return 'bg-secondary-subtle text-secondary-emphasis';
    }
}
