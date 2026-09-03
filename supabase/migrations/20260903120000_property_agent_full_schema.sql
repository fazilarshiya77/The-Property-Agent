-- =====================================================================
-- The Property Agent — Full Schema (Properties, Leads, Site Visits,
-- Activity Log), RLS policies, and Storage bucket setup.
--
-- This is a fresh, self-contained migration for a NEW Supabase project.
-- It supersedes the older numbered migrations in this folder, which were
-- written for a previous, unrelated Supabase project and no longer match
-- the current Property/Lead/SiteVisit shapes. Run this one.
-- =====================================================================

create extension if not exists pgcrypto;

-- Human-readable display codes (PA-KA-00001, LD-00001, SV-00001) are
-- generated server-side via these sequences, so the client never has to
-- compute them (and can't collide under concurrent inserts).
create sequence if not exists property_code_seq start 1;
create sequence if not exists lead_code_seq start 1;
create sequence if not exists visit_code_seq start 1;

-- =====================================================================
-- PROPERTIES
-- =====================================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique
    default ('PA-KA-' || lpad(nextval('property_code_seq')::text, 5, '0')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  title text not null,
  location text not null default '',
  area_name text not null default '',
  price numeric not null default 0,

  type text not null
    check (type in ('rent','sale','lease','commercial','plot','farmhouse','land')),
  category text not null default 'residential'
    check (category in ('residential','agricultural','commercial','hospitality','investment')),
  status text not null default 'draft'
    check (status in ('draft','available','published','reserved','sold','rented','inactive')),

  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  area numeric not null default 0,
  furnished text not null default 'unfurnished'
    check (furnished in ('fully','semi','unfurnished')),
  deposit text,
  availability text,
  floor text,
  facing text,

  amenities text[] not null default '{}',
  highlights text[] not null default '{}',
  images text[] not null default '{}',
  image_captions text[] not null default '{}',
  cover_image_index integer default 0,
  videos text[] not null default '{}',

  description text default '',
  short_description text,
  contact_email text,
  map_query text,

  reviews jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb,

  -- Karnataka location hierarchy
  district text,
  taluk text,
  city_town text,
  landmark text,
  pincode text,
  latitude text,
  longitude text,
  location_visibility text default 'exact'
    check (location_visibility in ('exact','approximate')),

  -- Price & financials
  price_type text default 'total'
    check (price_type in ('total','per_sqft','per_acre','per_guntha','per_cent')),
  negotiable boolean default false,
  min_expected_price numeric,
  advance_amount numeric,
  commission_type text check (commission_type in ('flat','percentage')),
  commission_value numeric,

  is_featured boolean not null default false,
  is_urgent boolean not null default false,
  seo_title text,
  seo_description text,
  slug text,
  meta_keywords text,

  -- Admin-only, never sent to the public site (enforced in app code, not DB)
  legal jsonb not null default '{}'::jsonb,
  source jsonb not null default '{}'::jsonb
);

create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_properties_district on public.properties(district);
create index if not exists idx_properties_featured on public.properties(is_featured) where is_featured = true;
create index if not exists idx_properties_created_at on public.properties(created_at desc);

-- =====================================================================
-- LEADS
-- =====================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique
    default ('LD-' || lpad(nextval('lead_code_seq')::text, 5, '0')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  phone text not null,
  whatsapp text,
  email text,

  interested_property_id uuid references public.properties(id) on delete set null,
  property_type_interested text,
  preferred_location text,
  budget text,
  purpose text check (purpose in ('investment','personal_use','rental','farming','vacation')),

  source text not null default 'direct'
    check (source in ('website','whatsapp','instagram','facebook','google','referral','direct','other')),
  status text not null default 'new'
    check (status in ('new','contacted','interested','site_visit_planned','site_visit_completed','negotiation','converted','lost')),
  temperature text not null default 'warm'
    check (temperature in ('hot','warm','cold')),

  notes text,
  next_follow_up_date date
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_property on public.leads(interested_property_id);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- =====================================================================
-- SITE VISITS
-- =====================================================================
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visit_code text not null unique
    default ('SV-' || lpad(nextval('visit_code_seq')::text, 5, '0')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  lead_id uuid references public.leads(id) on delete set null,
  lead_name text not null,
  property_id uuid references public.properties(id) on delete set null,
  property_title text not null,

  visit_date date not null,
  visit_time time,
  status text not null default 'scheduled'
    check (status in ('scheduled','confirmed','completed','cancelled','rescheduled')),
  feedback text,
  notes text
);

create index if not exists idx_visits_date on public.site_visits(visit_date);
create index if not exists idx_visits_status on public.site_visits(status);

-- =====================================================================
-- ACTIVITY LOG
-- =====================================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  module text not null check (module in ('property','lead','site_visit')),
  ref_id uuid,
  message text not null
);

create index if not exists idx_activity_created_at on public.activity_log(created_at desc);

-- =====================================================================
-- updated_at auto-touch
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_visits_updated_at on public.site_visits;
create trigger trg_visits_updated_at before update on public.site_visits
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Auto-log new rows into activity_log. SECURITY DEFINER so this fires
-- (and succeeds) whether the insert came from an authenticated admin in
-- the CRM or an anonymous visitor submitting a website enquiry — one
-- source of truth for "what just happened" instead of duplicating this
-- logic in every insert path on the client.
-- =====================================================================
create or replace function public.log_property_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into public.activity_log (module, ref_id, message)
  values ('property', new.id, 'Added "' || new.title || '" (' || new.property_code || ') as ' || new.status);
  return new;
end;
$$;
drop trigger if exists trg_log_property_insert on public.properties;
create trigger trg_log_property_insert after insert on public.properties
  for each row execute function public.log_property_insert();

create or replace function public.log_lead_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into public.activity_log (module, ref_id, message)
  values ('lead', new.id, 'New lead: ' || new.name || ' (' || new.lead_code || ') via ' || new.source);
  return new;
end;
$$;
drop trigger if exists trg_log_lead_insert on public.leads;
create trigger trg_log_lead_insert after insert on public.leads
  for each row execute function public.log_lead_insert();

create or replace function public.log_visit_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into public.activity_log (module, ref_id, message)
  values ('site_visit', new.id, 'Site visit scheduled: ' || new.lead_name || ' -> ' || new.property_title || ' (' || new.visit_date || ')');
  return new;
end;
$$;
drop trigger if exists trg_log_visit_insert on public.site_visits;
create trigger trg_log_visit_insert after insert on public.site_visits
  for each row execute function public.log_visit_insert();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.site_visits enable row level security;
alter table public.activity_log enable row level security;

-- Properties — public: published only. Authenticated (the admin): everything.
-- This is also what makes the existing "Preview" links on /listings/:id work
-- for a logged-in admin without any extra code: the same query that returns
-- nothing for an anonymous visitor on a draft property returns it in full
-- once the browser holds an authenticated session.
drop policy if exists properties_public_select_published on public.properties;
create policy properties_public_select_published on public.properties
  for select to anon using (status = 'published');

drop policy if exists properties_admin_select_all on public.properties;
create policy properties_admin_select_all on public.properties
  for select to authenticated using (true);

drop policy if exists properties_admin_insert on public.properties;
create policy properties_admin_insert on public.properties
  for insert to authenticated with check (true);

drop policy if exists properties_admin_update on public.properties;
create policy properties_admin_update on public.properties
  for update to authenticated using (true) with check (true);

drop policy if exists properties_admin_delete on public.properties;
create policy properties_admin_delete on public.properties
  for delete to authenticated using (true);

-- Leads — anyone can submit an enquiry (insert-only, forced to status='new').
-- Nobody but the admin can ever read, edit, or delete a lead.
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon with check (status = 'new');

drop policy if exists leads_admin_select on public.leads;
create policy leads_admin_select on public.leads
  for select to authenticated using (true);

drop policy if exists leads_admin_insert on public.leads;
create policy leads_admin_insert on public.leads
  for insert to authenticated with check (true);

drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads
  for update to authenticated using (true) with check (true);

drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads
  for delete to authenticated using (true);

-- Site visits — fully admin-only; there's no public "book a visit" form today.
drop policy if exists visits_admin_select on public.site_visits;
create policy visits_admin_select on public.site_visits
  for select to authenticated using (true);
drop policy if exists visits_admin_insert on public.site_visits;
create policy visits_admin_insert on public.site_visits
  for insert to authenticated with check (true);
drop policy if exists visits_admin_update on public.site_visits;
create policy visits_admin_update on public.site_visits
  for update to authenticated using (true) with check (true);
drop policy if exists visits_admin_delete on public.site_visits;
create policy visits_admin_delete on public.site_visits
  for delete to authenticated using (true);

-- Activity log — admin-only read. Inserts happen via the SECURITY DEFINER
-- triggers above (covers anon-sourced leads too) or directly from the
-- authenticated client for update/delete-derived entries.
drop policy if exists activity_admin_select on public.activity_log;
create policy activity_admin_select on public.activity_log
  for select to authenticated using (true);
drop policy if exists activity_admin_insert on public.activity_log;
create policy activity_admin_insert on public.activity_log
  for insert to authenticated with check (true);

-- =====================================================================
-- STORAGE — "properties" bucket (images/... and videos/... paths)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

drop policy if exists properties_bucket_public_read on storage.objects;
create policy properties_bucket_public_read on storage.objects
  for select to public using (bucket_id = 'properties');

drop policy if exists properties_bucket_admin_write on storage.objects;
create policy properties_bucket_admin_write on storage.objects
  for insert to authenticated with check (bucket_id = 'properties');

drop policy if exists properties_bucket_admin_update on storage.objects;
create policy properties_bucket_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'properties');

drop policy if exists properties_bucket_admin_delete on storage.objects;
create policy properties_bucket_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'properties');
