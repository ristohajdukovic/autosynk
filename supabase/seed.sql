insert into public.mechanic_locations (name, phone, address, rating, lat, lng)
values
  ('Coastal Auto Service', '+14155550010', '123 Harbor Blvd, San Francisco, CA', 4.7, 37.782, -122.42),
  ('Mission District Garage', '+14155550024', '456 Valencia St, San Francisco, CA', 4.5, 37.759, -122.421),
  ('Bay City Motors', '+14155550088', '789 Embarcadero, San Francisco, CA', 4.9, 37.800, -122.398),
  ('Sunset Auto Clinic', '+14155550111', '101 Lincoln Way, San Francisco, CA', 4.4, 37.765, -122.509),
  ('North Beach Mechanics', '+14155550177', '220 Columbus Ave, San Francisco, CA', 4.6, 37.799, -122.409)
on conflict do nothing;
