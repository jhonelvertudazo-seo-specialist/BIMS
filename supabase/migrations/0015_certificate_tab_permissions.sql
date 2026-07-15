-- Gives each Certificate Management tab (Barangay Clearance, Certificate
-- of Residency, Certificate of Indigency, Certificate of Good Moral
-- Character, Business Permit Endorsement, Cedula, and the cross-type
-- Issued Certificates view) its own permission module instead of all of
-- them sharing the single 'certificates' key. This lets a role be granted
-- some certificate types but not others (e.g. Staff can issue Barangay
-- Clearance but not Cedula) via the Permissions screen.
--
-- Only the Administrator role gets access by default — Staff starts with
-- none of these 7 modules granted (unlike most other modules, where Staff
-- gets view/add/edit/print/export out of the box). An Administrator must
-- explicitly grant a role or specific user access via the Permissions
-- screen before Staff can see or issue any certificate type. Administrator
-- also always bypasses the permissions table entirely via the isAdmin
-- check in src/lib/permissions.js — this seed just keeps the DB-side data
-- consistent with that.

do $$
declare
    admin_role_id uuid;
    staff_role_id uuid;
    m text;
    modules text[] := array[
        'certBarangayClearance', 'certResidency', 'certIndigency',
        'certGoodMoral', 'certBusinessEndorsement', 'certCedula', 'certIssued'
    ];
begin
    select id into admin_role_id from roles where role_name = 'Administrator';
    select id into staff_role_id from roles where role_name = 'Staff';

    foreach m in array modules loop
        if admin_role_id is not null then
            insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
            select admin_role_id, m, true, true, true, true, true, true, true
            where not exists (select 1 from permissions where role_id = admin_role_id and module_name = m);
        end if;

        if staff_role_id is not null then
            insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
            select staff_role_id, m, false, false, false, false, false, false, false
            where not exists (select 1 from permissions where role_id = staff_role_id and module_name = m);
        end if;
    end loop;
end $$;
