-- =====================================================================
-- GRANT for site_settings — same reason as 20260903130000_grants.sql:
-- RLS policies alone are not enough on this project. Postgres checks base
-- table privileges first; without this grant, every request from the
-- anon/authenticated roles fails with "permission denied" regardless of
-- how permissive the RLS policies are.
-- =====================================================================

grant select on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;
