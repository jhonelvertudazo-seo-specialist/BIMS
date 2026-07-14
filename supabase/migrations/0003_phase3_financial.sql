-- Phase 3: Financial Management
-- Run after 0002_phase2_business.sql

create table if not exists collections (
    id uuid primary key default gen_random_uuid(),
    or_number text unique,
    resident_id uuid references residents(id) on delete set null,
    business_id uuid references businesses(id) on delete set null,
    payment_type text,
    amount numeric default 0,
    payment_method text,
    cashier text,
    date_paid date,
    created_at timestamptz not null default now()
);

create table if not exists expenses (
    id uuid primary key default gen_random_uuid(),
    category text,
    description text,
    amount numeric default 0,
    supplier text,
    date date,
    approved_by text,
    created_at timestamptz not null default now()
);

create table if not exists budgets (
    id uuid primary key default gen_random_uuid(),
    fiscal_year text,
    category text,
    allocated_budget numeric default 0,
    remaining_budget numeric default 0,
    created_at timestamptz not null default now()
);

create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    table_name text not null,
    record_id text,
    action text not null,
    performed_by text,
    performed_at timestamptz not null default now(),
    details jsonb
);

alter table collections enable row level security;
alter table expenses enable row level security;
alter table budgets enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "Allow authenticated full access" on collections;
create policy "Allow authenticated full access" on collections for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on expenses;
create policy "Allow authenticated full access" on expenses for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on budgets;
create policy "Allow authenticated full access" on budgets for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated full access" on audit_logs;
create policy "Allow authenticated full access" on audit_logs for all to authenticated using (true) with check (true);
