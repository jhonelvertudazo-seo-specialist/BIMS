-- Moves super-admin designation from a hardcoded email (duplicated across
-- src/context/AuthContext.jsx, this migration, and 0009_user_permission_overrides.sql)
-- to a single source of truth: app_users.is_super_admin.
--
-- The hardcoded jhonelvertudazo@gmail.com check is kept as a fallback ONLY
-- (so a DB hiccup or a not-yet-applied migration can never lock the system
-- administrator out), matching the existing failsafe pattern in
-- 0007_admin_failsafe.sql. To transfer super-admin status to someone else
-- in future, set is_super_admin = true on their app_users row — no code
-- change required.

alter table app_users add column if not exists is_super_admin boolean not null default false;

update app_users
set is_super_admin = true
where email = 'jhonelvertudazo@gmail.com' and is_super_admin = false;

create or replace function is_super_admin()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from app_users
        where auth_user_id = auth.uid() and is_super_admin = true
    )
    or exists (
        select 1 from auth.users where id = auth.uid() and email = 'jhonelvertudazo@gmail.com'
    );
$$;
