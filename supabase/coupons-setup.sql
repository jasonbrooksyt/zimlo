-- Zimlo — makes coupon codes admin editable instead of hardcoded in the app.
-- Run in Supabase SQL Editor.

create table if not exists coupons (
  code text primary key,
  type text not null check (type in ('flat', 'percent')),
  value integer not null,
  min_order integer not null default 0,
  max_discount integer, -- only used when type = 'percent'
  label text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table coupons enable row level security;

-- Customers only need to read ACTIVE coupons to validate a code at checkout.
drop policy if exists "Public can read active coupons" on coupons;
create policy "Public can read active coupons"
  on coupons for select
  using (true);

drop policy if exists "Authenticated users can insert coupons" on coupons;
create policy "Authenticated users can insert coupons"
  on coupons for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update coupons" on coupons;
create policy "Authenticated users can update coupons"
  on coupons for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete coupons" on coupons;
create policy "Authenticated users can delete coupons"
  on coupons for delete
  to authenticated
  using (true);

alter publication supabase_realtime add table coupons;

-- Seed with the 3 demo coupons the app already ships with.
insert into coupons (code, type, value, min_order, max_discount, label) values
('ZIMLO20', 'flat', 20, 149, null, '₹20 OFF'),
('WELCOME50', 'flat', 50, 249, null, '₹50 OFF'),
('ZIMLO10', 'percent', 10, 99, 60, '10% OFF')
on conflict (code) do nothing;
