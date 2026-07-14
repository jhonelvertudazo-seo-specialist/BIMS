-- Phase 5: System Settings (Barangay Profile, Certificate Templates)
-- Run after 0005_phase4_operations.sql

create table if not exists system_settings (
    id uuid primary key default gen_random_uuid(),
    barangay_name text,
    barangay_code text,
    municipality text,
    province text,
    region text,
    zip_code text,
    contact_number text,
    email text,
    logo_url text,
    captain text,
    secretary text,
    treasurer text,
    mission text,
    vision text,
    created_at timestamptz not null default now()
);

create table if not exists certificate_templates (
    id uuid primary key default gen_random_uuid(),
    type text not null,
    header_text text,
    body_template text,
    footer_text text,
    created_at timestamptz not null default now()
);

alter table system_settings enable row level security;
alter table certificate_templates enable row level security;

drop policy if exists "Active users full access" on system_settings;
create policy "Active users full access" on system_settings for all to authenticated using (is_active_user()) with check (is_active_user());

drop policy if exists "Active users full access" on certificate_templates;
create policy "Active users full access" on certificate_templates for all to authenticated using (is_active_user()) with check (is_active_user());
