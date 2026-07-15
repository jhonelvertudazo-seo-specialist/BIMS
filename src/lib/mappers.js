export function residentFromRow(row) {
    return {
        id: row.id,
        residentId: row.resident_code,
        fullName: row.full_name,
        firstName: row.first_name || '',
        middleName: row.middle_name || '',
        lastName: row.last_name || '',
        suffix: row.suffix || '',
        gender: row.gender,
        birthDate: row.birth_date,
        birthPlace: row.birth_place || '',
        nationality: row.nationality || '',
        religion: row.religion || '',
        purok: row.purok,
        householdId: row.household_id || null,
        sitio: row.sitio || '',
        address: row.address || '',
        district: row.district || '',
        pollingPlace: row.polling_place || '',
        precinctNumber: row.precinct_number || '',
        civilStatus: row.civil_status,
        sector: row.sector,
        occupation: row.occupation || '',
        employer: row.employer || '',
        monthlyIncome: row.monthly_income == null ? null : Number(row.monthly_income),
        educationalAttainment: row.educational_attainment || '',
        employmentStatus: row.employment_status || '',
        contact: row.contact || '',
        email: row.email || '',
        registeredVoter: !!row.registered_voter,
        philsysNo: row.philsys_no || '',
        philhealthNo: row.philhealth_no || '',
        sssNo: row.sss_no || '',
        pagibigNo: row.pagibig_no || '',
        tin: row.tin || '',
        photoUrl: row.photo_url || '',
        status: row.status || 'Active',
        registeredBy: row.registered_by || '',
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
}

export function residentToRow(data) {
    return {
        resident_code: data.residentId,
        full_name: data.fullName,
        first_name: data.firstName || null,
        middle_name: data.middleName || null,
        last_name: data.lastName || null,
        suffix: data.suffix || null,
        gender: data.gender,
        birth_date: data.birthDate,
        birth_place: data.birthPlace || null,
        nationality: data.nationality || null,
        religion: data.religion || null,
        purok: data.purok,
        household_id: data.householdId || null,
        sitio: data.sitio || null,
        address: data.address || null,
        district: data.district || null,
        polling_place: data.pollingPlace || null,
        precinct_number: data.precinctNumber || null,
        civil_status: data.civilStatus,
        sector: data.sector,
        occupation: data.occupation || null,
        employer: data.employer || null,
        monthly_income: data.monthlyIncome === '' || data.monthlyIncome == null ? null : Number(data.monthlyIncome),
        educational_attainment: data.educationalAttainment || null,
        employment_status: data.employmentStatus || null,
        contact: data.contact || null,
        email: data.email || null,
        registered_voter: !!data.registeredVoter,
        philsys_no: data.philsysNo || null,
        philhealth_no: data.philhealthNo || null,
        sss_no: data.sssNo || null,
        pagibig_no: data.pagibigNo || null,
        tin: data.tin || null,
        photo_url: data.photoUrl || null,
        status: data.status || 'Active',
        registered_by: data.registeredBy || null,
    };
}

export function certificateFromRow(row) {
    return {
        id: row.id,
        residentId: row.resident_id,
        residentName: row.resident_name,
        type: row.type,
        fee: Number(row.fee),
        purpose: row.purpose || '',
        referenceNo: row.reference_no,
        issuedAt: row.issued_at ? new Date(row.issued_at).getTime() : Date.now(),
    };
}

export function certificateToRow(data) {
    return {
        resident_id: data.residentId,
        resident_name: data.residentName,
        type: data.type,
        fee: data.fee,
        purpose: data.purpose || null,
        reference_no: data.referenceNo,
    };
}

export function blotterFromRow(row) {
    return {
        id: row.id,
        caseNo: row.case_no,
        complainant: row.complainant,
        respondent: row.respondent,
        incidentType: row.incident_type,
        incidentDate: row.incident_date,
        details: row.details || '',
        status: row.status,
        filedAt: row.filed_at ? new Date(row.filed_at).getTime() : Date.now(),
        settledAt: row.settled_at ? new Date(row.settled_at).getTime() : null,
    };
}

export function blotterToRow(data) {
    return {
        case_no: data.caseNo,
        complainant: data.complainant,
        respondent: data.respondent,
        incident_type: data.incidentType,
        incident_date: data.incidentDate,
        details: data.details || null,
        status: data.status || 'Active',
    };
}

export function householdFromRow(row) {
    return {
        id: row.id,
        householdNo: row.household_no,
        purok: row.purok,
        address: row.address || '',
        headOfFamily: row.head_of_family,
        familyMembersCount: Number(row.family_members_count || 0),
        voterMembersCount: Number(row.voter_members_count || 0),
        pwdMembersCount: Number(row.pwd_members_count || 0),
        seniorMembersCount: Number(row.senior_members_count || 0),
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
}

export function householdToRow(data) {
    return {
        household_no: data.householdNo,
        purok: data.purok,
        address: data.address || null,
        head_of_family: data.headOfFamily,
        family_members_count: Number(data.familyMembersCount) || 0,
        voter_members_count: Number(data.voterMembersCount) || 0,
        pwd_members_count: Number(data.pwdMembersCount) || 0,
        senior_members_count: Number(data.seniorMembersCount) || 0,
    };
}
