-- Maintenance templates catalog and seeding helper

create table if not exists public.maintenance_templates (
  id bigserial primary key,
  make text not null,
  model text not null,
  fuel text not null,
  task text not null,
  interval_km numeric,
  interval_months int,
  notes text,
  unique (make, model, fuel, task)
);

insert into public.maintenance_templates (make, model, fuel, task, interval_km, interval_months, notes) values
('Dacia','Sandero','ICE/HEV','Engine oil & filter',15000,12,'Fixed service'),
('Dacia','Sandero','ICE/HEV','Cabin (pollen) filter',15000,12,''),
('Dacia','Sandero','ICE/HEV','Air filter',30000,24,''),
('Dacia','Sandero','ICE/HEV','Spark plugs (petrol)',60000,48,'Iridium may last longer'),
('Dacia','Sandero','ICE/HEV','Brake fluid',null,24,'Replace every 2 years'),
('Dacia','Sandero','ICE/HEV','Coolant',100000,60,''),

('Renault','Clio','ICE/HEV','Engine oil & filter',15000,12,''),
('Renault','Clio','ICE/HEV','Cabin filter',15000,12,''),
('Renault','Clio','ICE/HEV','Air filter',30000,24,''),
('Renault','Clio','ICE/HEV','Spark plugs (petrol)',60000,48,''),
('Renault','Clio','Diesel','Fuel filter',30000,24,'If equipped'),
('Renault','Clio','ICE/HEV','Brake fluid',null,24,''),

('Volkswagen','Golf','ICE/HEV','Engine oil & filter',15000,12,'Fixed; some markets variable up to 30k/24 mo'),
('Volkswagen','Golf','ICE/HEV','Cabin filter',15000,12,''),
('Volkswagen','Golf','ICE/HEV','Air filter',30000,24,''),
('Volkswagen','Golf','ICE/HEV','Spark plugs (TSI)',60000,48,''),
('Volkswagen','Golf','Diesel','Fuel filter (TDI)',30000,24,''),
('Volkswagen','Golf','ICE/HEV','Brake fluid',null,24,''),
('Volkswagen','Golf','ICE/HEV','DSG service (wet-clutch)',60000,null,'If applicable'),

('Tesla','Model Y','EV','Cabin air filter',null,24,'Tesla: replace every 2 years'),
('Tesla','Model Y','EV','Brake fluid health check',null,48,'Replace if needed'),
('Tesla','Model Y','EV','Tire rotation',10000,null,'Rotate about every 10k km or tread delta >= 1.5mm'),
('Tesla','Model Y','EV','Caliper clean/lube (salted roads)',20000,12,'Tesla guidance'),

('Volkswagen','T-Roc','ICE/HEV','Engine oil & filter',15000,12,''),
('Volkswagen','T-Roc','ICE/HEV','Cabin filter',15000,12,''),
('Volkswagen','T-Roc','ICE/HEV','Air filter',30000,24,''),
('Volkswagen','T-Roc','ICE/HEV','Spark plugs',60000,48,''),
('Volkswagen','T-Roc','ICE/HEV','Brake fluid',null,24,''),

('Peugeot','208','ICE/HEV','Engine oil & filter',15000,12,''),
('Peugeot','208','ICE/HEV','Cabin filter',15000,12,''),
('Peugeot','208','ICE/HEV','Air filter',30000,24,''),
('Peugeot','208','ICE/HEV','Spark plugs',60000,48,''),
('Peugeot','208','ICE/HEV','Brake fluid',null,24,''),

('Toyota','Yaris Cross','HEV','Engine oil & filter',15000,12,''),
('Toyota','Yaris Cross','HEV','Cabin filter',15000,12,''),
('Toyota','Yaris Cross','HEV','Air filter',30000,24,''),
('Toyota','Yaris Cross','HEV','Brake fluid',null,24,''),
('Toyota','Yaris Cross','HEV','Coolant (SLLC)',160000,120,''),

('Skoda','Octavia','ICE/HEV','Engine oil & filter',15000,12,''),
('Skoda','Octavia','ICE/HEV','Cabin filter',15000,12,''),
('Skoda','Octavia','ICE/HEV','Air filter',30000,24,''),
('Skoda','Octavia','ICE/HEV','Spark plugs',60000,48,''),
('Skoda','Octavia','Diesel','Fuel filter',30000,24,''),
('Skoda','Octavia','ICE/HEV','Brake fluid',null,24,''),

('Dacia','Duster','ICE/HEV','Engine oil & filter',15000,12,''),
('Dacia','Duster','ICE/HEV','Cabin filter',15000,12,''),
('Dacia','Duster','ICE/HEV','Air filter',30000,24,''),
('Dacia','Duster','ICE/HEV','Spark plugs',60000,48,''),
('Dacia','Duster','ICE/HEV','Brake fluid',null,24,''),

('Toyota','Yaris','HEV/ICE','Engine oil & filter',15000,12,''),
('Toyota','Yaris','HEV/ICE','Cabin filter',15000,12,''),
('Toyota','Yaris','HEV/ICE','Air filter',30000,24,''),
('Toyota','Yaris','HEV/ICE','Spark plugs (petrol)',60000,48,''),
('Toyota','Yaris','HEV/ICE','Brake fluid',null,24,''),
('Toyota','Yaris','HEV','Hybrid system check',null,12,'Dealer check'),

('Volkswagen','Tiguan','ICE/HEV','Engine oil & filter',15000,12,''),
('Volkswagen','Tiguan','ICE/HEV','Cabin filter',15000,12,''),
('Volkswagen','Tiguan','ICE/HEV','Air filter',30000,24,''),
('Volkswagen','Tiguan','ICE/HEV','Brake fluid',null,24,''),
('Volkswagen','Tiguan','ICE/HEV','DSG service (wet-clutch)',60000,null,'If applicable'),

('Peugeot','2008','ICE/HEV','Engine oil & filter',15000,12,''),
('Peugeot','2008','ICE/HEV','Cabin filter',15000,12,''),
('Peugeot','2008','ICE/HEV','Air filter',30000,24,''),
('Peugeot','2008','ICE/HEV','Brake fluid',null,24,''),

('Renault','Captur','ICE/HEV','Engine oil & filter',15000,12,''),
('Renault','Captur','ICE/HEV','Cabin filter',15000,12,''),
('Renault','Captur','ICE/HEV','Air filter',30000,24,''),
('Renault','Captur','ICE/HEV','Brake fluid',null,24,''),

('Opel/Vauxhall','Corsa','ICE/HEV','Engine oil & filter',15000,12,''),
('Opel/Vauxhall','Corsa','ICE/HEV','Cabin filter',15000,12,''),
('Opel/Vauxhall','Corsa','ICE/HEV','Air filter',30000,24,''),
('Opel/Vauxhall','Corsa','ICE/HEV','Spark plugs',60000,48,''),
('Opel/Vauxhall','Corsa','ICE/HEV','Brake fluid',null,24,''),

('Fiat','Panda','ICE','Engine oil & filter',15000,12,''),
('Fiat','Panda','ICE','Cabin filter',15000,12,''),
('Fiat','Panda','ICE','Air filter',30000,24,''),
('Fiat','Panda','ICE','Spark plugs',60000,48,''),
('Fiat','Panda','ICE','Brake fluid',null,24,''),

('Skoda','Fabia','ICE','Engine oil & filter',15000,12,''),
('Skoda','Fabia','ICE','Cabin filter',15000,12,''),
('Skoda','Fabia','ICE','Air filter',30000,24,''),
('Skoda','Fabia','ICE','Spark plugs',60000,48,''),
('Skoda','Fabia','ICE','Brake fluid',null,24,''),

('Hyundai','Tucson','ICE/HEV/PHEV','Engine oil & filter',15000,12,'Check engine-specific schedule'),
('Hyundai','Tucson','ICE/HEV/PHEV','Cabin filter',15000,12,''),
('Hyundai','Tucson','ICE/HEV/PHEV','Air filter',30000,24,''),
('Hyundai','Tucson','ICE/HEV/PHEV','Brake fluid',null,24,''),

('Nissan','Qashqai','ICE/HEV','Engine oil & filter',15000,12,''),
('Nissan','Qashqai','ICE/HEV','Cabin filter',15000,12,''),
('Nissan','Qashqai','ICE/HEV','Air filter',30000,24,''),
('Nissan','Qashqai','ICE/HEV','Brake fluid',null,24,''),

('Ford','Puma','ICE/HEV','Engine oil & filter',15000,12,''),
('Ford','Puma','ICE/HEV','Cabin filter',15000,12,''),
('Ford','Puma','ICE/HEV','Air filter',30000,24,''),
('Ford','Puma','ICE/HEV','Brake fluid',null,24,''),

('Toyota','Corolla','HEV/ICE','Engine oil & filter',16000,12,''),
('Toyota','Corolla','HEV/ICE','Cabin filter',15000,12,''),
('Toyota','Corolla','HEV/ICE','Air filter',30000,24,''),
('Toyota','Corolla','HEV/ICE','Spark plugs (petrol)',60000,48,''),
('Toyota','Corolla','HEV/ICE','Brake fluid',null,24,'')
on conflict (make, model, fuel, task) do update
  set interval_km = excluded.interval_km,
      interval_months = excluded.interval_months,
      notes = excluded.notes;

create or replace function public.seed_tasks_from_template(
  p_vehicle_id uuid,
  p_make text,
  p_model text,
  p_fuel text default 'ICE/HEV'
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_count int := 0;
begin
  select user_id into v_owner
  from public.vehicles
  where id = p_vehicle_id;

  if v_owner is null then
    raise exception 'Vehicle % not found', p_vehicle_id using errcode = 'P0002';
  end if;

  if v_owner <> auth.uid() then
    raise exception 'Not allowed to seed tasks for this vehicle' using errcode = '42501';
  end if;

  insert into public.maintenance_tasks (
    vehicle_id,
    title,
    description,
    interval_miles,
    interval_months,
    next_due_mileage,
    next_due_date,
    status,
    created_by
  )
  select
    p_vehicle_id,
    t.task,
    t.notes,
    t.interval_km,
    t.interval_months,
    null,
    null,
    'upcoming',
    auth.uid()
  from public.maintenance_templates t
  where t.make = p_make
    and t.model = p_model
    and t.fuel = p_fuel
  on conflict do nothing;

  get diagnostics v_count = row_count;

  if v_count = 0 then
    insert into public.maintenance_tasks (
      vehicle_id,
      title,
      description,
      interval_miles,
      interval_months,
      next_due_mileage,
      next_due_date,
      status,
      created_by
    )
    select
      p_vehicle_id,
      t.task,
      t.notes,
      t.interval_km,
      t.interval_months,
      null,
      null,
      'upcoming',
      auth.uid()
    from public.maintenance_templates t
    where t.make = p_make
      and t.model = p_model
    on conflict do nothing;

    get diagnostics v_count = row_count;
  end if;

  return v_count;
end
$$;

create index if not exists idx_templates_make_model_fuel
  on public.maintenance_templates (make, model, fuel);

alter table public.maintenance_templates enable row level security;

create policy "Anyone can read maintenance templates"
  on public.maintenance_templates
  for select
  using (true);
