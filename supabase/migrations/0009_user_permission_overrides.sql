-- Per-user permission overrides + lock permission editing to the system
-- administrator (Jhonel Vertudazo) specifically.
--
-- What this does:
--   1. Adds is_super_admin() — true only for jhonelvertudazo@gmail.com,
--      regardless of role or app_users state.
--   2. Creates user_permissions: same shape as `permissions`, but keyed by
--      app_user_id instead of role_id, with nullable columns. NULL means
--      "inherit from the user's role"; true/false explicitly overrides it
--      for that one person only.
--   3. Re-points the write policy on `permissions` (role matrix) from
--      is_active_administrator() to is_super_admin(), so only Jhonel can
--      change what a role grants — not just anyone holding the
--      Administrator role.

create or replace function is_super_admin()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from auth.users where id = auth.uid() and email = 'jhonelvertudazo@gmail.com'
    );
$$;

create table if not exists user_permissions (
    id uuid primary key default gen_random_uuid(),
    app_user_id uuid not null references app_users(id) on delete cascade,
    module_name text not null,
    can_view boolean,
    can_add boolean,
    can_edit boolean,
    can_delete boolean,
    can_print boolean,
    can_export boolean,
    can_approve boolean,
    created_at timestamptz not null default now(),
    unique (app_user_id, module_name)
);

alter table user_permissions enable row level security;

drop policy if exists "user_permissions select" on user_permissions;
create policy "user_permissions select" on user_permissions for select to authenticated using (is_active_user());

drop policy if exists "user_permissions super admin write" on user_permissions;
create policy "user_permissions super admin write" on user_permissions for all to authenticated
    using (is_super_admin()) with check (is_super_admin());

drop policy if exists "permissions admin write" on permissions;
drop policy if exists "permissions super admin write" on permissions;
create policy "permissions super admin write" on permissions for all to authenticated
    using (is_super_admin()) with check (is_super_admin());
