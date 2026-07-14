-- Phase 2: Business Management
-- Run after 0001_phase1_residents_and_sectoral.sql

create table if not exists businesses (
    id uuid primary key default gen_random_uuid(),
    business_code text unique,
    business_name text not null,
    owner_resident_id uuid references residents(id) on delete set null,
    business_type text,
    nature_of_business text,
    address text,
    contact_number text,
    email text,
    dti_number text,
    bir_tin text,
    permit_number text,
    date_registered date,
    expiration_date date,
    status text default 'Active',
    created_at timestamptz not null default now()
);

create table if not exists business_permits (
    id uuid primary key default gen_random_uuid(),
    business_id uuid references businesses(id) on delete cascade,
    permit_type text,
    or_number text unique,
    fee numeric default 0,
    issued_date date,
    expiration_date date,
    status text default 'Active',
    created_at timestamptz not null default now()
);

alter table businesses enable row level security;
alter table business_permits enable row level security;

drop policy if exists "Allow authenticated full access" on businesses;
create policy "Allow authenticated full access" on businesses for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on business_permits;
create policy "Allow authenticated full access" on business_permits for all to authenticated using (true) with check (true);
