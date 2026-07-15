-- Fixes residents registered before 0001_phase1_residents_and_sectoral.sql
-- showing blank First/Middle/Last Name (and other new phase-1 fields) when
-- edited. That migration added first_name/middle_name/last_name as new
-- nullable columns but never backfilled them from the pre-existing
-- full_name column, so any resident created before it was applied has
-- full_name populated but first_name/middle_name/last_name left NULL —
-- the edit form was correctly showing that there was no data there.
--
-- This does a best-effort split of full_name into first/last name for any
-- row where first_name is still null. Middle name/suffix can't be
-- reliably inferred from a single string, so multi-word middles are left
-- for staff to fill in manually via the edit form (which is no longer
-- blank now that first/last name show something).

update residents
set
    first_name = split_part(trim(full_name), ' ', 1),
    last_name = case
        when array_length(regexp_split_to_array(trim(full_name), '\s+'), 1) > 1
            then (regexp_split_to_array(trim(full_name), '\s+'))[array_length(regexp_split_to_array(trim(full_name), '\s+'), 1)]
        else null
    end
where first_name is null and full_name is not null and trim(full_name) <> '';
