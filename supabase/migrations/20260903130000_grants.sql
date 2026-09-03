-- =====================================================================
-- Table-level GRANTs — RLS policies alone are not enough. Postgres checks
-- base table privileges first, then RLS narrows what's visible/writable
-- within what the grant already allows. Without these, every request from
-- the anon/authenticated roles fails with "permission denied" regardless
-- of how permissive the RLS policies are.
-- =====================================================================

grant usage on schema public to anon, authenticated;

grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;

grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;

grant select, insert, update, delete on public.site_visits to authenticated;

grant select, insert on public.activity_log to authenticated;

-- Sequences backing the *_code defaults must be usable by whichever role
-- performs the insert (anon for leads, authenticated for properties/visits).
grant usage, select on all sequences in schema public to anon, authenticated;
