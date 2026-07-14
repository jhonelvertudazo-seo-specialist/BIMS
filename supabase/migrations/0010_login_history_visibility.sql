-- Login History tab was showing empty for anyone whose role wasn't
-- "Administrator": the "login_history admin select" policy only let
-- is_active_administrator() read rows, even though the Users module's
-- Login History tab is gated by the loginHistory permission (view), which
-- any role — or per-user override — can be granted. Open SELECT to every
-- active user so everyone who can open the tab sees the full history,
-- regardless of role.

drop policy if exists "login_history admin select" on login_history;
create policy "login_history active select" on login_history for select to authenticated using (is_active_user());
