// Fallback body text used when no custom row exists yet in
// certificate_templates for a given type, so printing works out of the
// box without requiring an admin to author a template first. Defining a
// row in the Certificate Templates tab for the same `type` overrides this.
// Matches the standard Philippine barangay clearance wording convention.
export const DEFAULT_CERTIFICATE_BODIES = {
    'Barangay Clearance':
        'This is to certify that {{prefix}} {{residentName}}, of legal age, {{nationality}}, and presently residing at {{address}}, Barangay {{barangayName}}, {{municipality}}, has been a bona fide resident of this barangay.<br/><br/>' +
        'This is further to certify that, based on the records of this office, the above-named person has no derogatory record and is known to be a person of good moral character in this community.<br/><br/>' +
        'This Barangay Clearance is issued upon the request of the above-named person for {{purpose}} and for whatever legal purpose it may serve.',
    'Certificate of Residency':
        'This is to certify that {{prefix}} {{residentName}}, {{nationality}}, is a bona fide resident of {{address}}, Barangay {{barangayName}}, {{municipality}}.<br/><br/>' +
        'This certification is issued upon the request of the above-named person for {{purpose}} and for whatever legal purpose it may serve.',
    'Certificate of Indigency':
        'This is to certify that {{prefix}} {{residentName}}, {{nationality}}, and presently residing at {{address}}, Barangay {{barangayName}}, {{municipality}}, belongs to an indigent family in this barangay based on the records of this office.<br/><br/>' +
        'This certification is issued upon the request of the above-named person for {{purpose}} and for whatever legal purpose it may serve.',
    'Certificate of Good Moral Character':
        'This is to certify that {{prefix}} {{residentName}}, {{nationality}}, and a resident of {{address}}, Barangay {{barangayName}}, {{municipality}}, is known to this office to be of good moral character and has not been involved in any activity contrary to law and morals.<br/><br/>' +
        'This certification is issued upon the request of the above-named person for {{purpose}} and for whatever legal purpose it may serve.',
    'Business Permit Endorsement':
        'This is to certify that {{prefix}} {{residentName}}, {{nationality}}, and a resident of {{address}}, Barangay {{barangayName}}, {{municipality}}, is endorsed by this office for {{purpose}}.<br/><br/>' +
        'This endorsement is issued for whatever legal purpose it may serve.',
    'Cedula':
        'This is to certify that {{prefix}} {{residentName}}, {{nationality}}, and a resident of {{address}}, Barangay {{barangayName}}, {{municipality}}, has paid the corresponding Community Tax (Cedula) for the current year in the amount indicated on this certificate.<br/><br/>' +
        'This Cedula is issued upon the request of the above-named person for {{purpose}} and for whatever legal purpose it may serve.',
};

export function renderTemplateText(text, data) {
    if (!text) return '';
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (data[key] ?? ''));
}

export function ordinalDay(day) {
    const n = Number(day);
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
}
