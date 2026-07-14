-- User Management + real access-control enforcement
-- Run after 0003_phase3_financial.sql, BEFORE using the app with more than one account.
--
-- What this does:
--   1. Creates app_users / roles / permissions / login_history tables.
--   2. Adds is_active_user() / is_active_administrator() helper functions.
--   3. Bootstraps: the very FIRST person to sign in (when app_users is empty) is
--      auto-provisioned as an Active Administrator. Everyone who signs in after
--      that gets a 'Pending' app_users row and cannot read/write ANY data until
--      an Administrator approves them from the Users screen.
--   4. Replaces the permissive "any authenticated user" policies on every table
--      (old and new) with is_active_user() so a Pending/Suspended account is
--      blocked at the database level, not just in the UI.

-- 1. Core tables -------------------------------------------------------

create table if not exists roles (
    id uuid primary key default gen_random_uuid(),
    role_name text unique not null,
    description text,
    created_at timestamptz not null default now()
);

create table if not exists app_users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique not null references auth.users(id) on delete cascade,
    employee_name text,
    username text,
    email text,
    contact_number text,
    role_id uuid references roles(id) on delete set null,
    department text,
    profile_photo_url text,
    last_login timestamptz,
    account_status text not null default 'Pending',
    created_at timestamptz not null default now()
);

create table if not exists permissions (
    id uuid primary key default gen_random_uuid(),
    role_id uuid references roles(id) on delete cascade,
    module_name text not null,
    can_view boolean default false,
    can_add boolean default false,
    can_edit boolean default false,
    can_delete boolean default false,
    can_print boolean default false,
    can_export boolean default false,
    can_approve boolean default false,
    created_at timestamptz not null default now(),
    unique (role_id, module_name)
);

create table if not exists login_history (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete cascade,
    email text,
    login_at timestamptz not null default now()
);

-- 2. Helper functions ---------------------------------------------------

create or replace function is_active_user()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from app_users
        where auth_user_id = auth.uid() and account_status = 'Active'
    )
    or not exists (select 1 from app_users limit 1);
$$;

create or replace function is_active_administrator()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from app_users u
        join roles r on r.id = u.role_id
        where u.auth_user_id = auth.uid() and u.account_status = 'Active' and r.role_name = 'Administrator'
    )
    or not exists (select 1 from app_users limit 1);
$$;

-- 3. Seed default roles + permission matrix -----------------------------

insert into roles (role_name, description) values
    ('Administrator', 'Full access to every module'),
    ('Staff', 'Standard barangay staff access (no delete/approve)')
on conflict (role_name) do nothing;

do $$
declare
    admin_role_id uuid;
    staff_role_id uuid;
    m text;
    modules text[] := array[
        'residents','households','families','seniorCitizens','pwdRecords','soloParents','voters','youthProfiles','residentSearch',
        'certificates','blotter',
        'businesses','businessClearance','permitRenewal','businessOwners','businessReports',
        'collections','receipts','expenses','budget','financialReports','auditTrail',
        'healthRecords','vaccinations','prenatalCare','medicalAssistance','medicineInventory',
        'evacuationCenters','disasterIncidents','reliefDistribution','rescueOperations','disasterReports',
        'projects','beneficiaries',
        'documents','assets','supplies','maintenance',
        'events','appointments','calendar',
        'reports',
        'users','roles','permissions','activityLogs','loginHistory','settings'
    ];
begin
    select id into admin_role_id from roles where role_name = 'Administrator';
    select id into staff_role_id from roles where role_name = 'Staff';

    foreach m in array modules loop
        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select admin_role_id, m, true, true, true, true, true, true, true
        where not exists (select 1 from permissions where role_id = admin_role_id and module_name = m);

        insert into permissions (role_id, module_name, can_view, can_add, can_edit, can_delete, can_print, can_export, can_approve)
        select staff_role_id, m, true, true, true, false, true, true, false
        where not exists (select 1 from permissions where role_id = staff_role_id and module_name = m);
    end loop;
end $$;

-- 3b. Guarantee Jhonel Vertudazo is an active Administrator regardless of
-- sign-in order (in addition to the first-login bootstrap above).
insert into app_users (auth_user_id, email, employee_name, role_id, account_status)
select u.id, u.email, 'Jhonel Vertudazo', r.id, 'Active'
from auth.users u
cross join roles r
where u.email = 'jhonelvertudazo@gmail.com' and r.role_name = 'Administrator'
on conflict (auth_user_id) do update set role_id = excluded.role_id, account_status = 'Active';

-- 4. RLS on the new tables ----------------------------------------------

alter table roles enable row level security;
alter table app_users enable row level security;
alter table permissions enable row level security;
alter table login_history enable row level security;

drop policy if exists "roles select" on roles;
create policy "roles select" on roles for select to authenticated using (is_active_user());
drop policy if exists "roles admin write" on roles;
create policy "roles admin write" on roles for all to authenticated using (is_active_administrator()) with check (is_active_administrator());

drop policy if exists "permissions select" on permissions;
create policy "permissions select" on permissions for select to authenticated using (is_active_user());
drop policy if exists "permissions admin write" on permissions;
create policy "permissions admin write" on permissions for all to authenticated using (is_active_administrator()) with check (is_active_administrator());

drop policy if exists "app_users select" on app_users;
create policy "app_users select" on app_users for select to authenticated using (auth_user_id = auth.uid() or is_active_user());
drop policy if exists "app_users self insert" on app_users;
create policy "app_users self insert" on app_users for insert to authenticated
    with check (auth_user_id = auth.uid() and (account_status = 'Pending' or not exists (select 1 from app_users limit 1)));
drop policy if exists "app_users admin write" on app_users;
create policy "app_users admin write" on app_users for update to authenticated using (is_active_administrator()) with check (is_active_administrator());
drop policy if exists "app_users admin delete" on app_users;
create policy "app_users admin delete" on app_users for delete to authenticated using (is_active_administrator());

drop policy if exists "login_history self insert" on login_history;
create policy "login_history self insert" on login_history for insert to authenticated with check (auth_user_id = auth.uid());
drop policy if exists "login_history admin select" on login_history;
create policy "login_history admin select" on login_history for select to authenticated using (is_active_administrator());

-- 5. Lock down every existing table behind is_active_user() -------------

drop policy if exists "Allow authenticated full access" on families;
create policy "Active users full access" on families for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on senior_citizens;
create policy "Active users full access" on senior_citizens for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on pwd_records;
create policy "Active users full access" on pwd_records for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on solo_parents;
create policy "Active users full access" on solo_parents for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on youth_profiles;
create policy "Active users full access" on youth_profiles for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on businesses;
create policy "Active users full access" on businesses for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on business_permits;
create policy "Active users full access" on business_permits for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on collections;
create policy "Active users full access" on collections for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on expenses;
create policy "Active users full access" on expenses for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on budgets;
create policy "Active users full access" on budgets for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Allow authenticated full access" on audit_logs;
create policy "Active users full access" on audit_logs for all to authenticated using (is_active_user()) with check (is_active_user());

-- Legacy tables (residents/households/certificates/blotters) predate this
-- migration folder, so we don't know their existing policy names — drop
-- whatever is there dynamically, then apply the same rule.
do $$
declare
    pol record;
begin
    for pol in
        select policyname, tablename from pg_policies
        where schemaname = 'public' and tablename in ('residents', 'households', 'certificates', 'blotters')
    loop
        execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
    end loop;
end $$;

create policy "Active users full access" on residents for all to authenticated using (is_active_user()) with check (is_active_user());
create policy "Active users full access" on households for all to authenticated using (is_active_user()) with check (is_active_user());
create policy "Active users full access" on certificates for all to authenticated using (is_active_user()) with check (is_active_user());
create policy "Active users full access" on blotters for all to authenticated using (is_active_user()) with check (is_active_user());

-- 6. Storage bucket: same is_active_user() gate --------------------------

drop policy if exists "bims-uploads authenticated read" on storage.objects;
create policy "bims-uploads active read" on storage.objects for select to authenticated using (bucket_id = 'bims-uploads' and is_active_user());

drop policy if exists "bims-uploads authenticated write" on storage.objects;
create policy "bims-uploads active write" on storage.objects for insert to authenticated with check (bucket_id = 'bims-uploads' and is_active_user());

drop policy if exists "bims-uploads authenticated update" on storage.objects;
create policy "bims-uploads active update" on storage.objects for update to authenticated using (bucket_id = 'bims-uploads' and is_active_user());

drop policy if exists "bims-uploads authenticated delete" on storage.objects;
create policy "bims-uploads active delete" on storage.objects for delete to authenticated using (bucket_id = 'bims-uploads' and is_active_user());
