create extension if not exists "uuid-ossp";

create type maintenance_status as enum ('upcoming', 'completed', 'overdue');

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can manage their profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nickname text,
  make text not null,
  model text not null,
  year int,
  vin text,
  base_mileage numeric,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Users can manage their vehicles"
  on public.vehicles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.odometer_entries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles on delete cascade,
  mileage numeric not null,
  confidence numeric,
  photo_url text,
  notes text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users on delete cascade
);

alter table public.odometer_entries enable row level security;

create policy "Owners manage odometer entries"
  on public.odometer_entries
  for all
  using (
    auth.uid() = created_by
    and vehicle_id in (select id from public.vehicles where user_id = auth.uid())
  )
  with check (auth.uid() = created_by);

create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles on delete cascade,
  title text not null,
  service_date date not null,
  mileage numeric,
  cost numeric,
  notes text,
  attachments jsonb,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users on delete cascade
);

alter table public.service_records enable row level security;

create policy "Owners manage service records"
  on public.service_records
  for all
  using (
    auth.uid() = created_by
    and vehicle_id in (select id from public.vehicles where user_id = auth.uid())
  )
  with check (auth.uid() = created_by);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles on delete cascade,
  title text not null,
  description text,
  interval_miles numeric,
  interval_months int,
  next_due_mileage numeric,
  next_due_date date,
  status maintenance_status not null default 'upcoming',
  last_completed_mileage numeric,
  last_completed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users on delete cascade
);

alter table public.maintenance_tasks enable row level security;

create policy "Owners manage maintenance tasks"
  on public.maintenance_tasks
  for all
  using (
    auth.uid() = created_by
    and vehicle_id in (select id from public.vehicles where user_id = auth.uid())
  )
  with check (auth.uid() = created_by);

create table if not exists public.mechanic_locations (
  id bigserial primary key,
  name text not null,
  phone text,
  address text not null,
  rating numeric,
  lat numeric not null,
  lng numeric not null,
  created_at timestamptz not null default now()
);

alter table public.mechanic_locations enable row level security;

create policy "Mechanics readable by all" on public.mechanic_locations
  for select
  using (true);

create or replace function public.get_timeline_events(p_vehicle_id uuid)
returns table (
  id uuid,
  label text,
  type text,
  occurred_at timestamptz,
  mileage numeric,
  status maintenance_status
) language sql security definer
set search_path = public
as $$
  select
    sr.id,
    sr.title as label,
    'service'::text as type,
    sr.service_date::timestamptz as occurred_at,
    sr.mileage,
    null::maintenance_status as status
  from public.service_records sr
  where sr.vehicle_id = p_vehicle_id

  union all

  select
    mt.id,
    mt.title,
    'maintenance'::text,
    coalesce(mt.next_due_date, now())::timestamptz,
    mt.next_due_mileage,
    mt.status
  from public.maintenance_tasks mt
  where mt.vehicle_id = p_vehicle_id

  union all

  select
    oe.id,
    'Odometer update' as label,
    'odometer'::text,
    oe.recorded_at,
    oe.mileage,
    null::maintenance_status as status
  from public.odometer_entries oe
  where oe.vehicle_id = p_vehicle_id
  order by occurred_at desc
$$;

insert into storage.buckets (id, name, public)
  values ('odometer-photos', 'odometer-photos', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('vehicle-photos', 'vehicle-photos', true)
  on conflict (id) do nothing;

create policy "Public read odometer photos"
  on storage.objects for select
  using (bucket_id = 'odometer-photos');

create policy "Owners upload odometer photos"
  on storage.objects for insert
  with check (bucket_id = 'odometer-photos');

create policy "Public read vehicle photos"
  on storage.objects for select
  using (bucket_id = 'vehicle-photos');

create policy "Owners upload vehicle photos"
  on storage.objects for insert
  with check (bucket_id = 'vehicle-photos');
