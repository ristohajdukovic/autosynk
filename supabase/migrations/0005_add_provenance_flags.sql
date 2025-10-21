-- Ensure provenance flags exist on key tables

alter table public.service_records
  add column if not exists provenance text;

alter table public.service_records
  alter column provenance set default 'manual',
  alter column provenance set not null;

do $$
begin
  alter table public.service_records
    add constraint service_records_provenance_check
    check (
      provenance in (
        'manual',
        'user_verified_receipt',
        'odometer_photo_verified',
        'shop_verified_api'
      )
    )
    not valid;
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter table public.service_records
    validate constraint service_records_provenance_check;
exception
  when duplicate_object then
    null;
end
$$;

alter table public.odometer_entries
  add column if not exists provenance text;

alter table public.odometer_entries
  alter column provenance set default 'manual',
  alter column provenance set not null;

do $$
begin
  alter table public.odometer_entries
    add constraint odometer_entries_provenance_check
    check (
      provenance in (
        'manual',
        'odometer_photo_verified',
        'user_verified_receipt',
        'shop_verified_api'
      )
    )
    not valid;
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter table public.odometer_entries
    validate constraint odometer_entries_provenance_check;
exception
  when duplicate_object then
    null;
end
$$;
