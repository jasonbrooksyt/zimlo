-- Zimlo — moves Orders from per-device localStorage into a shared table,
-- so an admin's status/price update reaches the customer's phone live,
-- and a customer's placed order reaches the admin's dashboard live.
-- Run in Supabase SQL Editor.

create table if not exists orders (
  id text primary key,
  type text not null, -- 'food' | 'bakery' | 'grocery' | 'medicine' | 'parcel' | 'custom'
  customer_phone text not null,
  address text not null,
  status text not null default 'placed',
  payment_method text,
  payment_method_preference text, -- customer's preferred method, for request orders before pricing
  price_confirmed boolean not null default false,
  total integer,
  subtotal integer,
  discount integer default 0,
  coupon_code text,
  delivery_fee integer,
  cod_fee integer default 0,
  notes text,
  requirement text, -- free-text requirement for Bakery/Grocery/Medicine/Parcel/Custom
  items jsonb, -- Food orders only: array of {id, name, nameHi, price, qty, ...}
  created_at timestamptz default now()
);

alter table orders enable row level security;

-- NOTE on privacy: customer login in this app is a demo OTP flow, not real
-- Supabase Auth, so RLS can't restrict reads to "your own orders only" yet.
-- Read access is public (anon key) so a customer's own Orders/Tracking
-- screens work without a Supabase login. Placing an order is public too,
-- for the same reason. Only status/price updates (admin actions) require
-- a real signed-in Supabase user. If you later add real phone-based
-- Supabase Auth for customers, tighten the select policy to
-- `using (customer_phone = auth.jwt() ->> 'phone')`.
drop policy if exists "Public can read orders" on orders;
create policy "Public can read orders"
  on orders for select
  using (true);

drop policy if exists "Public can insert orders" on orders;
create policy "Public can insert orders"
  on orders for insert
  with check (true);

drop policy if exists "Authenticated users can update orders" on orders;
create policy "Authenticated users can update orders"
  on orders for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete orders" on orders;
create policy "Authenticated users can delete orders"
  on orders for delete
  to authenticated
  using (true);

alter publication supabase_realtime add table orders;
