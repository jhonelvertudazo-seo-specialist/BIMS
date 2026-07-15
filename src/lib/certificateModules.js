// Each Certificate Management tab is gated by its own permission module
// key (see src/lib/modules.js and supabase/migrations/0015_certificate_tab_permissions.sql)
// instead of sharing the single 'certificates' key, so a role can be
// granted e.g. Barangay Clearance without also getting Cedula.
export const CERTIFICATE_TYPE_MODULE_KEYS = {
    'Barangay Clearance': 'certBarangayClearance',
    'Certificate of Residency': 'certResidency',
    'Certificate of Indigency': 'certIndigency',
    'Certificate of Good Moral Character': 'certGoodMoral',
    'Business Permit Endorsement': 'certBusinessEndorsement',
    'Cedula': 'certCedula',
};

// The "Issued Certificates" tab (cross-type record/audit view).
export const ISSUED_CERTIFICATES_MODULE_KEY = 'certIssued';

// Falls back to the base 'certificates' key for any type not in the map
// above (e.g. legacy data from before per-type permissions existed).
export function moduleKeyForCertificateType(type) {
    return CERTIFICATE_TYPE_MODULE_KEYS[type] || 'certificates';
}
