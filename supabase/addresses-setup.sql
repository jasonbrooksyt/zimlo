-- Zimlo — saved delivery addresses, so a customer doesn't have to retype
-- their address on every order. Tied to the customer's real Supabase
-- identity (auth.uid()) — same identity used for orders privacy.
-- lat/lng are optional — filled in automatically when the customer uses
-- the "Use my current location" (GPS) option.
-- Run in Supabase SQL Editor (after orders-privacy-setup.sql).

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home', -- 'Home' | 'Work' | 'Other' | custom
  address_line text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

-- Safe to re-run: adds the GPS columns even if the table already existed
-- from an earlier version of this file.
alter table addresses add column if not exists latitude double precision;
alter table addresses add column if not exists longitude double precision;

alter table addresses enable row level security;

-- A customer can fully manage (read/add/edit/delete) only their OWN
-- saved addresses — nobody else's, including other customers or admins.
drop policy if exists "Users manage their own addresses" on addresses;
create policy "Users manage their own addresses"
  on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter publication supabase_realtime add table addresses;
