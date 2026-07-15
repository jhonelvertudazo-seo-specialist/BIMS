-- Database-level audit logging for every table that currently has no
-- audit trail at all (residents/households/sectoral registries/business/
-- financial-config/health/disaster/projects/inventory/scheduling/security
-- tables). Today, audit_logs only gets written when a specific call site
-- remembers to call src/lib/auditLog.js (certificates, blotters,
-- collections, expenses) — everything else is silently unaudited.
--
-- This migration adds a single generic trigger function and attaches it
-- to every remaining table so INSERT/UPDATE/DELETE is always recorded,
-- regardless of which UI path performed it. It is additive only: the
-- existing app-level logAudit() calls for certificates/blotters/
-- collections/expenses are untouched and keep writing their own
-- (more descriptive) entries alongside this generic one.

create or replace function fn_audit_log()
returns trigger
language plpgsql
security definer
as $$
declare
    v_record_id text;
    v_details jsonb;
begin
    if tg_op = 'DELETE' then
        v_record_id := old.id::text;
        v_details := to_jsonb(old);
    else
        v_record_id := new.id::text;
        v_details := to_jsonb(new);
    end if;

    insert into audit_logs (table_name, record_id, action, performed_by, details)
    values (tg_table_name, v_record_id, lower(tg_op), coalesce(auth.jwt() ->> 'email', 'system'), v_details);

    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

do $$
declare
    t text;
    tables text[] := array[
        'residents', 'households', 'families',
        'senior_citizens', 'pwd_records', 'solo_parents', 'youth_profiles',
        'businesses', 'business_permits', 'budgets',
        'health_records', 'vaccinations', 'prenatal_records', 'medical_assistance', 'medicines',
        'evacuation_centers', 'disaster_incidents', 'relief_distributions', 'rescue_operations',
        'projects', 'project_beneficiaries',
        'documents',
        'suppliers', 'assets', 'supplies', 'maintenance_records',
        'events', 'appointments',
        'puroks', 'certificate_templates',
        'roles', 'permissions', 'user_permissions'
    ];
begin
    foreach t in array tables loop
        if to_regclass('public.' || t) is not null then
            execute format('drop trigger if exists trg_audit_log on public.%I', t);
            execute format(
                'create trigger trg_audit_log after insert or update or delete on public.%I for each row execute function fn_audit_log()',
                t
            );
        end if;
    end loop;
end $$;
