-- Phase 4: Health Services, Disaster Risk Reduction, Projects & Programs,
-- Document Management, Inventory & Asset Management, Scheduling
-- Run after 0004_user_management_and_rls.sql (uses is_active_user()).

-- 1. Health Services ------------------------------------------------------

create table if not exists health_records (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    blood_type text,
    allergies text,
    medical_history text,
    created_at timestamptz not null default now()
);

create table if not exists vaccinations (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    vaccine_name text,
    dose text,
    date_vaccinated date,
    health_worker text,
    remarks text,
    created_at timestamptz not null default now()
);

create table if not exists prenatal_records (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    lmp_date date,
    edc_date date,
    trimester text,
    prenatal_visits integer default 0,
    health_worker text,
    remarks text,
    created_at timestamptz not null default now()
);

create table if not exists medical_assistance (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete cascade,
    assistance_type text,
    medicine_given text,
    date date,
    health_worker text,
    remarks text,
    created_at timestamptz not null default now()
);

create table if not exists medicines (
    id uuid primary key default gen_random_uuid(),
    item_name text not null,
    category text,
    unit text,
    quantity integer default 0,
    reorder_level integer default 0,
    expiry_date date,
    created_at timestamptz not null default now()
);

-- 2. Disaster Risk Reduction ----------------------------------------------

create table if not exists evacuation_centers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    capacity integer default 0,
    current_occupancy integer default 0,
    status text default 'Available',
    created_at timestamptz not null default now()
);

create table if not exists disaster_incidents (
    id uuid primary key default gen_random_uuid(),
    disaster_type text,
    date date,
    time time,
    location text,
    families_affected integer default 0,
    residents_affected integer default 0,
    casualties integer default 0,
    officer_in_charge text,
    remarks text,
    created_at timestamptz not null default now()
);

create table if not exists relief_distributions (
    id uuid primary key default gen_random_uuid(),
    incident_id uuid references disaster_incidents(id) on delete set null,
    household_id uuid references households(id) on delete set null,
    relief_goods text,
    date date,
    released_by text,
    created_at timestamptz not null default now()
);

create table if not exists rescue_operations (
    id uuid primary key default gen_random_uuid(),
    incident_id uuid references disaster_incidents(id) on delete set null,
    team text,
    details text,
    date date,
    created_at timestamptz not null default now()
);

-- 3. Projects & Programs ----------------------------------------------------

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    project_name text not null,
    program_type text default 'Community Project',
    description text,
    budget numeric default 0,
    start_date date,
    end_date date,
    status text default 'Planned',
    project_manager text,
    completion_percentage integer default 0,
    created_at timestamptz not null default now()
);

create table if not exists project_beneficiaries (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    resident_id uuid references residents(id) on delete cascade,
    date_added date default current_date,
    created_at timestamptz not null default now()
);

-- 4. Document Management -----------------------------------------------------

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    category text default 'Uploaded File',
    file_url text,
    file_type text,
    file_size text,
    uploaded_by text,
    upload_date date default current_date,
    expiration_date date,
    version text,
    description text,
    status text default 'Active',
    created_at timestamptz not null default now()
);

-- 5. Inventory & Asset Management ---------------------------------------------

create table if not exists suppliers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    contact text,
    address text,
    created_at timestamptz not null default now()
);

create table if not exists assets (
    id uuid primary key default gen_random_uuid(),
    barcode text unique,
    asset_name text not null,
    category text,
    brand text,
    model text,
    serial_number text,
    purchase_date date,
    purchase_cost numeric default 0,
    assigned_to text,
    location text,
    condition text default 'Good',
    status text default 'Available',
    created_at timestamptz not null default now()
);

create table if not exists supplies (
    id uuid primary key default gen_random_uuid(),
    item_name text not null,
    category text,
    unit text,
    quantity integer default 0,
    reorder_level integer default 0,
    supplier_id uuid references suppliers(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists maintenance_records (
    id uuid primary key default gen_random_uuid(),
    asset_id uuid references assets(id) on delete cascade,
    date date,
    description text,
    cost numeric default 0,
    performed_by text,
    created_at timestamptz not null default now()
);

-- 6. Scheduling ---------------------------------------------------------------

create table if not exists events (
    id uuid primary key default gen_random_uuid(),
    event_name text not null,
    description text,
    date date,
    time time,
    venue text,
    organizer text,
    event_type text default 'Event',
    status text default 'Scheduled',
    created_at timestamptz not null default now()
);

create table if not exists appointments (
    id uuid primary key default gen_random_uuid(),
    resident_id uuid references residents(id) on delete set null,
    purpose text,
    date date,
    time time,
    status text default 'Scheduled',
    created_at timestamptz not null default now()
);

-- 7. RLS: same is_active_user() gate as every other module table -------------

do $$
declare
    t text;
    tables text[] := array[
        'health_records','vaccinations','prenatal_records','medical_assistance','medicines',
        'evacuation_centers','disaster_incidents','relief_distributions','rescue_operations',
        'projects','project_beneficiaries',
        'documents',
        'suppliers','assets','supplies','maintenance_records',
        'events','appointments'
    ];
begin
    foreach t in array tables loop
        execute format('alter table %I enable row level security', t);
        execute format('drop policy if exists "Active users full access" on %I', t);
        execute format('create policy "Active users full access" on %I for all to authenticated using (is_active_user()) with check (is_active_user())', t);
    end loop;
end $$;
