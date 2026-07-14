-- Fail-safe: the system administrator (Jhonel Vertudazo) must never be
-- blocked by the approval workflow, even if app_users/roles data is missing,
-- was reset, or earlier migrations weren't applied yet.
--
-- Safe to run multiple times. Safe to run even if 0001-0006 have not been
-- applied yet -- it creates the roles/app_users tables itself if needed.
-- Run this NOW if Jhonel still can't get past the Pending/loading screen.

create extension if not exists pgcrypto;

create table if not exists roles (
    id uuid primary key default gen_random_uuid(),
    role_name text unique not null,
    description text,
    created_at timestamptz not null default now()
);

insert into roles (role_name, description) values
    ('Administrator', 'Full access to every module')
on conflict (role_name) do nothing;

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

-- Force Jhonel Active + Administrator, whether or not a row already exists for him.
insert into app_users (auth_user_id, email, employee_name, role_id, account_status)
select u.id, u.email, 'Jhonel Vertudazo', r.id, 'Active'
from auth.users u
cross join roles r
where u.email = 'jhonelvertudazo@gmail.com' and r.role_name = 'Administrator'
on conflict (auth_user_id) do update set
    role_id = excluded.role_id,
    account_status = 'Active';

-- Belt-and-suspenders: these two functions gate every table's RLS. Redefine
-- them so Jhonel's email unconditionally passes, independent of whatever
-- state the app_users row is in (deleted, edited, wrong role, etc.).
create or replace function is_active_user()
returns boolean
language sql
security definer
stable
as $$
    select
        exists (select 1 from auth.users where id = auth.uid() and email = 'jhonelvertudazo@gmail.com')
        or exists (
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
    select
        exists (select 1 from auth.users where id = auth.uid() and email = 'jhonelvertudazo@gmail.com')
        or exists (
            select 1 from app_users u
            join roles r on r.id = u.role_id
            where u.auth_user_id = auth.uid() and u.account_status = 'Active' and r.role_name = 'Administrator'
        )
        or not exists (select 1 from app_users limit 1);
$$;

-- Verify (should show one row, account_status = 'Active'):
select id, auth_user_id, email, account_status, role_id from app_users where email = 'jhonelvertudazo@gmail.com';
