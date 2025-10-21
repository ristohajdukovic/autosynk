-- EU inspection and budget helpers

create or replace function public.compute_next_inspection(
  p_country text,
  p_first_registration date,
  p_last_passed date
) returns date
language sql
stable
set search_path = public
as $$
  with rule as (
    select first_interval_months, repeat_interval_months
    from public.inspection_rules
    where country_code = coalesce(p_country, '')
      and vehicle_class = 'Passenger'
    limit 1
  )
  select case
    when rule.first_interval_months is null then null
    when p_last_passed is null then
      (p_first_registration + make_interval(months => rule.first_interval_months))
    else
      greatest(
        (p_first_registration + make_interval(months => rule.first_interval_months)),
        (p_last_passed + make_interval(months => rule.repeat_interval_months))
      )
  end
  from rule;
$$;

create or replace function public.upsert_vehicle_inspection(
  p_vehicle_id uuid,
  p_country text,
  p_first_registration date,
  p_last_passed date default null
) returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_next_due date;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select user_id into v_owner
  from public.vehicles
  where id = p_vehicle_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Vehicle not found or not owned' using errcode = '42501';
  end if;

  select public.compute_next_inspection(p_country, p_first_registration, p_last_passed)
  into v_next_due;

  if v_next_due is null then
    raise exception 'Inspection rule missing for %', p_country using errcode = 'P0001';
  end if;

  insert into public.vehicle_inspections (
    user_id,
    vehicle_id,
    country_code,
    first_registration_date,
    last_completed_date,
    next_due_date
  ) values (
    auth.uid(),
    p_vehicle_id,
    p_country,
    p_first_registration,
    p_last_passed,
    v_next_due
  )
  on conflict (vehicle_id) do update
    set country_code = excluded.country_code,
        first_registration_date = excluded.first_registration_date,
        last_completed_date = excluded.last_completed_date,
        next_due_date = excluded.next_due_date,
        updated_at = now()
    returning next_due_date
    into v_next_due;

  return v_next_due;
end
$$;

create or replace function public.forecast_budget(
  p_vehicle_id uuid,
  p_country text,
  p_months int default 12
) returns table (
  month date,
  estimated_eur numeric,
  breakdown jsonb
)
language plpgsql
stable
set search_path = public
as $$
declare
  v_baseline record;
begin
  select labour_index, parts_index
  into v_baseline
  from public.cost_baselines
  where country_code = p_country
  order by effective_from desc
  limit 1;

  if not found then
    select 1.00 as labour_index, 1.00 as parts_index into v_baseline;
  end if;

  return query
  with upcoming as (
    select
      coalesce(next_due_date, (now() + make_interval(months => 3)))::date as due_date,
      interval_months,
      title
    from public.maintenance_tasks
    where vehicle_id = p_vehicle_id
      and status in ('upcoming', 'overdue')
  ),
  expanded as (
    select
      due_date,
      title,
      interval_months,
      greatest(1, interval_months)::numeric as months_interval,
      greatest(1, interval_months)::numeric / p_months as weighting
    from upcoming
  )
  select
    date_trunc('month', due_date)::date as month,
    round(
      (weighting * (150 * v_baseline.labour_index + 120 * v_baseline.parts_index))::numeric,
      2
    ) as estimated_eur,
    jsonb_build_object(
      'title', title,
      'labour_index', v_baseline.labour_index,
      'parts_index', v_baseline.parts_index,
      'assumed_interval_months', interval_months
    ) as breakdown
  from expanded
  where due_date <= (now() + make_interval(months => p_months))
  order by month;
end
$$;
