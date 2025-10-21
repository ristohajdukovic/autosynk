-- EU data scaffolding (countries, inspections, budgeting)

create table if not exists public.eu_countries (
  code text primary key,
  name text not null
);

insert into public.eu_countries (code, name) values
  ('DE', 'Germany'),
  ('FR', 'France'),
  ('ES', 'Spain'),
  ('IT', 'Italy'),
  ('UK', 'United Kingdom'),
  ('AT', 'Austria'),
  ('NL', 'Netherlands'),
  ('BE', 'Belgium'),
  ('SE', 'Sweden'),
  ('PL', 'Poland')
on conflict (code) do update
  set name = excluded.name;

create table if not exists public.inspection_rules (
  id bigserial primary key,
  country_code text not null references public.eu_countries (code) on delete cascade,
  vehicle_class text not null,
  first_interval_months int not null,
  repeat_interval_months int not null,
  notes text,
  unique (country_code, vehicle_class)
);

insert into public.inspection_rules (
  country_code,
  vehicle_class,
  first_interval_months,
  repeat_interval_months,
  notes
) values
  ('DE', 'Passenger', 36, 24, 'TÜV first at 3 years, then every 2 years'),
  ('FR', 'Passenger', 48, 24, 'Contrôle technique after 4 years, then every 2 years'),
  ('ES', 'Passenger', 48, 24, 'ITV due after 4 years, then biennial until 10th year'),
  ('IT', 'Passenger', 48, 24, 'Revisione every two years after year four'),
  ('UK', 'Passenger', 36, 12, 'MOT required annually after year three'),
  ('NL', 'Passenger', 48, 24, 'APK cadence varies, simplified to every 2 years'),
  ('SE', 'Passenger', 36, 14, 'First inspection after 3 years, then every 14 months'),
  ('PL', 'Passenger', 36, 12, 'First at 3 years, then after 2 years, simplified to annual'),
  ('DE', 'LCV', 24, 12, 'Light commercial vehicles inspected yearly'),
  ('FR', 'LCV', 24, 12, 'Vans require a control technique every year')
on conflict (country_code, vehicle_class) do update
  set first_interval_months = excluded.first_interval_months,
      repeat_interval_months = excluded.repeat_interval_months,
      notes = excluded.notes;

create table if not exists public.vehicle_inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  country_code text not null references public.eu_countries (code),
  first_registration_date date not null,
  last_completed_date date,
  next_due_date date not null,
  rule_id bigint references public.inspection_rules (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicle_inspections_user ON public.vehicle_inspections (user_id);
create index if not exists idx_vehicle_inspections_vehicle ON public.vehicle_inspections (vehicle_id);
create unique index if not exists uq_vehicle_inspections_vehicle on public.vehicle_inspections (vehicle_id);

alter table public.vehicle_inspections enable row level security;

create policy "Vehicle inspection owner select"
  on public.vehicle_inspections
  for select
  using (auth.uid() = user_id);

create policy "Vehicle inspection owner modify"
  on public.vehicle_inspections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.cost_baselines (
  id bigserial primary key,
  country_code text not null references public.eu_countries (code),
  labour_index numeric(6,2) not null default 1.00,
  parts_index numeric(6,2) not null default 1.00,
  currency text not null default 'EUR',
  effective_from date not null default current_date,
  notes text,
  unique (country_code, effective_from)
);

insert into public.cost_baselines (country_code, labour_index, parts_index, currency, notes) values
  ('DE', 1.15, 1.05, 'EUR', 'Higher labour in central EU markets'),
  ('FR', 1.10, 1.03, 'EUR', 'Paris region costs considered'),
  ('ES', 0.92, 0.95, 'EUR', 'Lower labour rates'),
  ('IT', 1.05, 1.02, 'EUR', 'Northern Italy averages'),
  ('UK', 1.20, 1.06, 'EUR', 'GBP indexed and converted to EUR baseline'),
  ('AT', 1.08, 1.02, 'EUR', 'Vienna and Salzburg averages'),
  ('NL', 1.12, 1.04, 'EUR', 'Randstad region mix'),
  ('BE', 1.07, 1.03, 'EUR', 'Brussels/Antwerp blend'),
  ('SE', 1.18, 1.05, 'EUR', 'Labour higher in Nordic markets'),
  ('PL', 0.75, 0.85, 'EUR', 'Emerging market cost profile')
on conflict (country_code, effective_from) do update
  set labour_index = excluded.labour_index,
      parts_index = excluded.parts_index,
      currency = excluded.currency,
      notes = excluded.notes;

create table if not exists public.budget_forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  country_code text not null references public.eu_countries (code),
  labour_cost_estimate numeric(10,2),
  parts_cost_estimate numeric(10,2),
  total_cost_estimate numeric(10,2),
  horizon_months int not null default 12,
  valid_until date,
  generated_at timestamptz not null default now(),
  notes text
);

create index if not exists idx_budget_forecasts_owner on public.budget_forecasts (user_id);
create index if not exists idx_budget_forecasts_vehicle on public.budget_forecasts (vehicle_id);

alter table public.budget_forecasts enable row level security;

create policy "Budget forecast owner select"
  on public.budget_forecasts
  for select
  using (auth.uid() = user_id);

create policy "Budget forecast owner modify"
  on public.budget_forecasts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
