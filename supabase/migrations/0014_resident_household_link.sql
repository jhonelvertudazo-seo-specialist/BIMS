-- Links residents to households directly. Previously the only path from a
-- household to a resident was through the separate `families` table
-- (household_id + family_head_resident_id), and household member counts
-- (family_members_count, voter_members_count, pwd_members_count,
-- senior_members_count) were plain manually-typed integers with nothing
-- keeping them in sync with actual resident records.
--
-- This adds a direct residents.household_id FK so the app can compute
-- household member counts automatically from real linked residents
-- instead of relying on manual entry (see src/utils/householdStats.js and
-- the resident add/update/delete hooks in src/context/DataContext.jsx).

alter table residents add column if not exists household_id uuid references households(id) on delete set null;
