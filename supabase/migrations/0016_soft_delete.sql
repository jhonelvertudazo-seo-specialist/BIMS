-- Soft delete: every "Delete" action across the app now marks a row with
-- deleted_at instead of removing it, so it can be recovered from the new
-- Recycle Bin screen (or permanently purged from there once you're sure).
--
-- This adds a nullable deleted_at column to every table that has a
-- Delete action in the UI. Application queries filter deleted_at is null
-- for normal views (src/hooks/useGenericEntity.js, src/context/DataContext.jsx)
-- and deleted_at is not null for the Recycle Bin. RLS is untouched — the
-- filtering happens at the query level so the Recycle Bin (querying the
-- opposite condition) still works under the same is_active_user() policy.

do $$
declare
    t text;
    tables text[] := array[
        'residents', 'households', 'certificates', 'blotters',
        'families', 'senior_citizens', 'pwd_records', 'solo_parents', 'youth_profiles',
        'businesses', 'business_permits',
        'collections', 'expenses', 'budgets',
        'health_records', 'vaccinations', 'prenatal_records', 'medical_assistance', 'medicines',
        'evacuation_centers', 'disaster_incidents', 'relief_distributions', 'rescue_operations',
        'projects', 'project_beneficiaries',
        'documents',
        'suppliers', 'assets', 'supplies', 'maintenance_records',
        'events', 'appointments',
        'puroks', 'certificate_templates', 'roles'
    ];
begin
    foreach t in array tables loop
        if to_regclass('public.' || t) is not null then
            execute format('alter table public.%I add column if not exists deleted_at timestamptz', t);
        end if;
    end loop;
end $$;

-- Recycle Bin module — Administrator only by default, same convention as
-- the certificate tabs (0015_certificate_tab_permissions.sql): purging a
-- record is permanent, so Staff/other roles start with no access until an
-- Administrator explicitly grants it via Permissions.
do $$
declare
    admin_role_id uuid;
    staff_role_id uuid;
begin
    select id into admin_role_id from roles where role_name = 'Administrator';
    select id into staff_role_id from roles where role_name = 'Staff';

    if admin_role_id is not null then
        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select admin_role_id, 'recycleBin', true, true, true, true, true, true, true
        where not exists (select 1 from permissions where role_id = admin_role_id and module_name = 'recycleBin');
    end if;

    if staff_role_id is not null then
        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select staff_role_id, 'recycleBin', false, false, false, false, false, false, false
        where not exists (select 1 from permissions where role_id = staff_role_id and module_name = 'recycleBin');
    end if;
end $$;
