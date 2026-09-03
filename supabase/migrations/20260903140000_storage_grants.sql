-- =====================================================================
-- Same gotcha as the public-schema tables: storage.buckets and
-- storage.objects need explicit GRANTs before RLS policies on them can
-- take effect for the anon/authenticated roles.
-- =====================================================================

grant usage on schema storage to anon, authenticated;

grant select on storage.buckets to anon, authenticated;

grant select on storage.objects to anon;
grant select, insert, update, delete on storage.objects to authenticated;
