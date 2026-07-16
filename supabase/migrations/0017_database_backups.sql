-- In-app "Backup Now" feature for Settings -> Backup & Restore.
--
-- A true one-click "back up the whole Postgres database" can't safely
-- happen from the browser — that needs a privileged DB connection string,
-- which this app deliberately never embeds client-side (see the "Add a
-- New User" explanation in UsersPage.jsx for the same reasoning). Instead,
-- this gives Administrators a button that snapshots the core record data
-- (residents, households, certificates, blotter records — the same four
-- covered by the existing manual CSV export) as one JSON file, uploads it
-- to a dedicated Storage bucket, and logs it here so the page can list
-- backup history in a table.
--
-- Both the table and the bucket are admin-only: a backup file is a full
-- PII dump across modules, so it needs stricter gating than the 'settings'
-- permission that merely lets a role view this screen.

insert into storage.buckets (id, name, public)
select 'bims-backups', 'bims-backups', false
where not exists (select 1 from storage.buckets where id = 'bims-backups');

create table if not exists database_backups (
    id uuid primary key default gen_random_uuid(),
    file_path text not null,
    file_name text not null,
    size_bytes bigint not null default 0,
    record_counts jsonb not null default '{}'::jsonb,
    created_by text,
    created_at timestamptz not null default now()
);

alter table database_backups enable row level security;

drop policy if exists "database_backups admin select" on database_backups;
create policy "database_backups admin select" on database_backups for select to authenticated using (is_active_administrator());
drop policy if exists "database_backups admin insert" on database_backups;
create policy "database_backups admin insert" on database_backups for insert to authenticated with check (is_active_administrator());
drop policy if exists "database_backups admin delete" on database_backups;
create policy "database_backups admin delete" on database_backups for delete to authenticated using (is_active_administrator());

drop policy if exists "bims-backups admin read" on storage.objects;
create policy "bims-backups admin read" on storage.objects for select to authenticated using (bucket_id = 'bims-backups' and is_active_administrator());
drop policy if exists "bims-backups admin write" on storage.objects;
create policy "bims-backups admin write" on storage.objects for insert to authenticated with check (bucket_id = 'bims-backups' and is_active_administrator());
drop policy if exists "bims-backups admin delete" on storage.objects;
create policy "bims-backups admin delete" on storage.objects for delete to authenticated using (bucket_id = 'bims-backups' and is_active_administrator());
