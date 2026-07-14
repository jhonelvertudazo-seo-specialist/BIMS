-- Purok Management (Resident Management sub-module)
-- Run after 0007_admin_failsafe.sql

create table if not exists puroks (
    id uuid primary key default gen_random_uuid(),
    purok_name text not null unique,
    purok_leader text,
    contact_number text,
    zone_number text,
    description text,
    status text default 'Active',
    created_at timestamptz not null default now()
);

alter table puroks enable row level security;

drop policy if exists "Active users full access" on puroks;
create policy "Active users full access" on puroks for all to authenticated using (is_active_user()) with check (is_active_user());

-- Seed permissions for the new 'puroks' module (safe/idempotent, works whether
-- or not you've re-run 0004 since this module key was added).
do $$
declare
    admin_role_id uuid;
    staff_role_id uuid;
begin
    select id into admin_role_id from roles where role_name = 'Administrator';
    select id into staff_role_id from roles where role_name = 'Staff';

    if admin_role_id is not null then
        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select admin_role_id, 'puroks', true, true, true, true, true, true, true
        where not exists (select 1 from permissions where role_id = admin_role_id and module_name = 'puroks');
    end if;

    if staff_role_id is not null then
        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select staff_role_id, 'puroks', true, true, true, false, true, true, false
        where not exists (select 1 from permissions where role_id = staff_role_id and module_name = 'puroks');
    end if;
end $$;

-- Seed the puroks already used as free-text dropdown values in the app,
-- so counts show up immediately (safe to edit/rename afterwards from the UI).
insert into puroks (purok_name)
select p from unnest(array['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6']) as p
where not exists (select 1 from puroks where purok_name = p);
