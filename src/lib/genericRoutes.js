import { familiesConfig } from './entityConfigs/families.js';
import { seniorCitizensConfig } from './entityConfigs/seniorCitizens.js';
import { pwdRecordsConfig } from './entityConfigs/pwdRecords.js';
import { soloParentsConfig } from './entityConfigs/soloParents.js';
import { youthProfilesConfig } from './entityConfigs/youthProfiles.js';
import { businessesConfig } from './entityConfigs/businesses.js';
import { businessClearanceConfig, permitRenewalConfig } from './entityConfigs/businessPermits.js';
import { collectionsConfig, receiptsConfig } from './entityConfigs/collections.js';
import { expensesConfig } from './entityConfigs/expenses.js';
import { budgetsConfig } from './entityConfigs/budgets.js';
import { rolesConfig } from './entityConfigs/roles.js';
import {
    healthRecordsConfig, vaccinationsConfig, prenatalRecordsConfig, medicalAssistanceConfig, medicinesConfig,
} from './entityConfigs/health.js';
import {
    evacuationCentersConfig, disasterIncidentsConfig, reliefDistributionsConfig, rescueOperationsConfig,
} from './entityConfigs/disaster.js';
import {
    projectsConfig, livelihoodProgramsConfig, scholarshipProgramsConfig, progressMonitoringConfig, projectBeneficiariesConfig,
} from './entityConfigs/projects.js';
import {
    documentsConfig, ordinancesConfig, resolutionsConfig, meetingMinutesConfig, archiveConfig,
} from './entityConfigs/documents.js';
import {
    assetsConfig, assetAssignmentConfig, suppliesConfig, suppliersConfig, maintenanceConfig,
} from './entityConfigs/inventory.js';
import { eventsConfig, barangaySessionsConfig, appointmentsConfig } from './entityConfigs/scheduling.js';
import { certificateTemplatesConfig } from './entityConfigs/certificateTemplates.js';
import { puroksConfig } from './entityConfigs/puroks.js';

export const genericRoutes = [
    { path: 'roles', config: rolesConfig },
    { path: 'families', config: familiesConfig },
    { path: 'senior-citizens', config: seniorCitizensConfig },
    { path: 'pwd', config: pwdRecordsConfig },
    { path: 'solo-parents', config: soloParentsConfig },
    { path: 'youth', config: youthProfilesConfig },
    { path: 'businesses', config: businessesConfig },
    { path: 'business-clearance', config: businessClearanceConfig },
    { path: 'permit-renewal', config: permitRenewalConfig },
    { path: 'collections', config: collectionsConfig },
    { path: 'receipts', config: receiptsConfig },
    { path: 'expenses', config: expensesConfig },
    { path: 'budget', config: budgetsConfig },
    { path: 'health-records', config: healthRecordsConfig },
    { path: 'vaccinations', config: vaccinationsConfig },
    { path: 'prenatal-care', config: prenatalRecordsConfig },
    { path: 'medical-assistance', config: medicalAssistanceConfig },
    { path: 'medicine-inventory', config: medicinesConfig },
    { path: 'evacuation-centers', config: evacuationCentersConfig },
    { path: 'disaster-incidents', config: disasterIncidentsConfig },
    { path: 'relief-distribution', config: reliefDistributionsConfig },
    { path: 'rescue-operations', config: rescueOperationsConfig },
    { path: 'projects', config: projectsConfig },
    { path: 'livelihood-programs', config: livelihoodProgramsConfig },
    { path: 'scholarship-programs', config: scholarshipProgramsConfig },
    { path: 'progress-monitoring', config: progressMonitoringConfig },
    { path: 'beneficiaries', config: projectBeneficiariesConfig },
    { path: 'documents', config: documentsConfig },
    { path: 'ordinances', config: ordinancesConfig },
    { path: 'resolutions', config: resolutionsConfig },
    { path: 'meeting-minutes', config: meetingMinutesConfig },
    { path: 'archive', config: archiveConfig },
    { path: 'equipment', config: assetsConfig },
    { path: 'asset-assignment', config: assetAssignmentConfig },
    { path: 'supplies', config: suppliesConfig },
    { path: 'suppliers', config: suppliersConfig },
    { path: 'maintenance', config: maintenanceConfig },
    { path: 'events', config: eventsConfig },
    { path: 'barangay-sessions', config: barangaySessionsConfig },
    { path: 'appointments', config: appointmentsConfig },
    { path: 'settings/certificate-templates', config: certificateTemplatesConfig },
    { path: 'puroks', config: puroksConfig },
];
