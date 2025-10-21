create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles on delete set null,
  task_title text not null,
  details text,
  country_code text,
  city text,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

create policy "Quote requests readable by owner"
  on public.quote_requests
  for select
  using (auth.uid() = created_by);

create policy "Quote requests insertable by owner"
  on public.quote_requests
  for insert
  with check (auth.uid() = created_by);

create policy "Quote requests deletable by owner"
  on public.quote_requests
  for delete
  using (auth.uid() = created_by);
