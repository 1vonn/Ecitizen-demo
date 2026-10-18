-- ============================================================================
-- HudumaConnect | Public Service Request System (Mini eCitizen-style)
-- Supabase Database Schema, Auto-Confirm Trigger & RLS Policies (No Dummy Data)
-- Matches prisma/schema.prisma
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key,
  email text unique,
  full_name text,
  phone text,
  national_id text,
  role text not null default 'citizen',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column updated_at set default now();

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists national_id text;
alter table public.profiles add column if not exists role text not null default 'citizen';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_profiles_role on public.profiles(role);

-- 2. SERVICE REQUESTS TABLE
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique,
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  citizen_name text,
  citizen_email text,
  title text,
  category text not null,
  location text not null,
  description text not null,
  image_url text,
  priority text not null default 'Medium',
  status text not null default 'Pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure column defaults are set even if table was initially created by Prisma without dbgenerated()
alter table public.service_requests alter column id set default gen_random_uuid();
alter table public.service_requests alter column status set default 'Pending';
alter table public.service_requests alter column priority set default 'Medium';
alter table public.service_requests alter column created_at set default now();
alter table public.service_requests alter column updated_at set default now();

alter table public.service_requests add column if not exists reference_number text unique;
alter table public.service_requests add column if not exists citizen_name text;
alter table public.service_requests add column if not exists citizen_email text;
alter table public.service_requests add column if not exists title text;
alter table public.service_requests add column if not exists image_url text;
alter table public.service_requests add column if not exists priority text not null default 'Medium';
alter table public.service_requests add column if not exists admin_note text;
alter table public.service_requests add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_service_requests_citizen_id on public.service_requests(citizen_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_service_requests_category on public.service_requests(category);
create index if not exists idx_service_requests_reference on public.service_requests(reference_number);

-- 3. REQUEST STATUS HISTORY TABLE
create table if not exists public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid,
  created_at timestamptz not null default now()
);

alter table public.request_status_history alter column id set default gen_random_uuid();
alter table public.request_status_history alter column created_at set default now();

create index if not exists idx_request_status_history_request_id on public.request_status_history(request_id);

-- 4. AUTO-UPDATE updated_at TRIGGER
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_service_requests_updated_at on public.service_requests;
create trigger set_service_requests_updated_at
  before update on public.service_requests
  for each row execute function public.handle_updated_at();

-- 5. AUTO-CONFIRM EMAIL & CREATE PROFILE ON SUPABASE AUTH SIGNUP
create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, national_id, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'national_id',
    coalesce(new.raw_user_meta_data->>'role', 'citizen')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    role = coalesce(excluded.role, public.profiles.role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. GRANTS & ROW LEVEL SECURITY (RLS) POLICIES
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.profiles to anon, authenticated, service_role;
grant all on table public.service_requests to anon, authenticated, service_role;
grant all on table public.request_status_history to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_status_history enable row level security;

drop policy if exists "Allow all profile operations" on public.profiles;
create policy "Allow all profile operations"
  on public.profiles
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow all service request operations" on public.service_requests;
create policy "Allow all service request operations"
  on public.service_requests
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow all status history operations" on public.request_status_history;
create policy "Allow all status history operations"
  on public.request_status_history
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 7. REMOVE DUMMY SEED DATA SO ONLY REAL USER DATA REMAINS
delete from public.service_requests
where id in (
  'a1000001-0000-4000-8000-000000000001',
  'a1000002-0000-4000-8000-000000000002',
  'a1000003-0000-4000-8000-000000000003',
  'a1000004-0000-4000-8000-000000000004',
  'a1000005-0000-4000-8000-000000000005'
);

delete from public.profiles
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
);
