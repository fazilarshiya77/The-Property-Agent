-- =====================================================================
-- SITE SETTINGS — admin-editable Call/WhatsApp numbers + basic business
-- info, previously hardcoded across the public site. Single-row table
-- (id = 1) read publicly, writable only by an authenticated admin.
-- =====================================================================

create table if not exists public.site_settings (
  id integer primary key default 1,
  constraint site_settings_singleton check (id = 1),

  call_number text not null default '+919019488368',
  whatsapp_number text not null default '+919019488368',
  business_name text not null default 'The Property Agent',
  business_email text not null default 'trishnaproperties78@gmail.com',

  updated_at timestamptz not null default now()
);

-- Seed the single row if it doesn't exist yet.
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Reuses the same updated_at touch function created in the main schema
-- migration; recreated here (idempotently) so this file also runs
-- standalone on a project that hasn't run that migration.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS — anyone (including anonymous website visitors) can read the
-- current numbers; only an authenticated admin can change them.
-- =====================================================================
alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_select on public.site_settings;
create policy site_settings_public_select on public.site_settings
  for select to anon using (true);

drop policy if exists site_settings_admin_select on public.site_settings;
create policy site_settings_admin_select on public.site_settings
  for select to authenticated using (true);

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update on public.site_settings
  for update to authenticated using (id = 1) with check (id = 1);

-- No insert/delete policies — the single row is seeded by this migration
-- and is never created or removed from the client.
