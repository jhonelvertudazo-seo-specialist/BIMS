-- Phase 1: Resident Management completion
-- Run this once in the Supabase SQL editor (or via `supabase db push` if you have the CLI linked).
-- Safe to run on top of the existing residents/households/certificates/blotters tables.

-- 1. Extend residents with the full Resident Registration field set from the BIMS spec.
alter table residents
    add column if not exists first_name text,
    add column if not exists middle_name text,
    add column if not exists last_name text,
    add column if not exists suffix text,
    add column if not exists birth_place text,
    add column if not exists nationality text,
    add column if not exists religion text,
    add column if not exists employer text,
    add column if not exists monthly_income numeric,
    add column if not exists educational_attainment text,
    add column if not exists email text,
    add column if not exists sitio text,
    add column if not exists district text,
    add column if not exists polling_place text,
    add column if not exists precinct_number text,
    add column if not exists philsys_no text,
    add column if not exists philhealth_no text,
    add column if not exists sss_no text,
    add column if not exists pagibig_no text,
    add column if not exists tin text,
    add column if not exists photo_url text,
    add column if not exists status text default 'Active',
    add column if not exists registered_by text;

-- 2. Sectoral / sub-module tables, all linked back to residents.
create table if not exists families (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references households(id) on delete set null,
    family_head_resident_id uuid references residents(id) on delete set null,
    relationship text,
    num_children integer default 0,
    num_dependents integer default 0,
    family_income numeric,
    poverty_classification text,
    indigenous_group text,
    emergency_contact text,
    created_at timestamptz not null default now()
);

create table if not exists senior_citizens (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    osca_number text,
    pension_status text,
    pension_type text,
    date_registered date,
    medical_conditions text,
    emergency_contact text,
    created_at timestamptz not null default now()
);

create table if not exists pwd_records (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    pwd_id_number text,
    disability_type text,
    disability_cause text,
    date_issued date,
    expiration_date date,
    assistance_received text,
    created_at timestamptz not null default now()
);

create table if not exists solo_parents (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    solo_parent_id text,
    reason text,
    num_dependents integer default 0,
    date_issued date,
    expiration_date date,
    created_at timestamptz not null default now()
);

create table if not exists youth_profiles (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    student_status text,
    school text,
    organization text,
    created_at timestamptz not null default now()
);

-- 3. RLS: same permissive single-role model as the rest of the app today.
alter table families enable row level security;
alter table senior_citizens enable row level security;
alter table pwd_records enable row level security;
alter table solo_parents enable row level security;
alter table youth_profiles enable row level security;

drop policy if exists "Allow authenticated full access" on families;
create policy "Allow authenticated full access" on families for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on senior_citizens;
create policy "Allow authenticated full access" on senior_citizens for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on pwd_records;
create policy "Allow authenticated full access" on pwd_records for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on solo_parents;
create policy "Allow authenticated full access" on solo_parents for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on youth_profiles;
create policy "Allow authenticated full access" on youth_profiles for all to authenticated using (true) with check (true);

-- 4. Shared storage bucket for all module file uploads (resident photos, documents, asset photos, etc.)
insert into storage.buckets (id, name, public)
values ('bims-uploads', 'bims-uploads', true)
on conflict (id) do nothing;

drop policy if exists "bims-uploads authenticated read" on storage.objects;
create policy "bims-uploads authenticated read" on storage.objects for select to authenticated using (bucket_id = 'bims-uploads');

drop policy if exists "bims-uploads authenticated write" on storage.objects;
create policy "bims-uploads authenticated write" on storage.objects for insert to authenticated with check (bucket_id = 'bims-uploads');

drop policy if exists "bims-uploads authenticated update" on storage.objects;
create policy "bims-uploads authenticated update" on storage.objects for update to authenticated using (bucket_id = 'bims-uploads');

drop policy if exists "bims-uploads authenticated delete" on storage.objects;
create policy "bims-uploads authenticated delete" on storage.objects for delete to authenticated using (bucket_id = 'bims-uploads');
