-- Zimlo — Supabase schema for the live menu (dishes table).
-- Run this once in your Supabase project's SQL Editor.

create table if not exists dishes (
  id text primary key,
  subcategory text not null,
  name text not null,
  name_hi text not null,
  price integer not null check (price > 0),
  veg boolean not null default true,
  img text not null default '🍽️',
  created_at timestamptz default now()
);

-- Row Level Security: anyone (including logged-out customers) can READ the
-- menu, but only a signed-in admin (Supabase Auth user) can add, edit, or
-- delete dishes. This is what actually secures the Admin Menu screen —
-- not the login page itself.
alter table dishes enable row level security;

drop policy if exists "Public can read dishes" on dishes;
create policy "Public can read dishes"
  on dishes for select
  using (true);

drop policy if exists "Authenticated users can insert dishes" on dishes;
create policy "Authenticated users can insert dishes"
  on dishes for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update dishes" on dishes;
create policy "Authenticated users can update dishes"
  on dishes for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete dishes" on dishes;
create policy "Authenticated users can delete dishes"
  on dishes for delete
  to authenticated
  using (true);

-- Enable Realtime so price/menu edits push live to every open customer
-- screen (Database -> Replication -> toggle "dishes" ON in the dashboard,
-- or run this):
alter publication supabase_realtime add table dishes;
