-- =====================================================================
-- Multiple Call Numbers — the admin can now keep more than one call
-- number (e.g. a primary and a backup line). WhatsApp stays a single
-- number, since a business only has one active WhatsApp line.
-- =====================================================================

alter table public.site_settings
  add column if not exists call_numbers text[] not null default '{}';

-- Backfill from the old single call_number column, if it had a value and
-- call_numbers hasn't been populated yet.
update public.site_settings
set call_numbers = array[call_number]
where call_number is not null
  and call_number <> ''
  and (call_numbers is null or array_length(call_numbers, 1) is null);

-- call_number itself is left in place (unused by the app going forward)
-- rather than dropped, so nothing breaks if any cached client code still
-- reads it during rollout.
