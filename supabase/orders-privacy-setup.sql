-- Zimlo — makes each customer's orders private using Supabase's real
-- Anonymous Auth (no paid SMS provider needed). Every customer's browser
-- gets a real, secure Supabase identity (auth.uid()); orders are tied to
-- it, and Row Level Security enforces "you only see your own orders."
-- Admins (real email/password login) can still see everything.
--
-- BEFORE running this: go to Supabase Dashboard -> Authentication ->
-- Sign In / Providers -> enable "Allow anonymous sign-ins". Free, no
-- external account needed.
--
-- Run this AFTER orders-setup.sql.

alter table orders add column if not exists user_id uuid references auth.users(id);

-- Replace the old fully-public read/insert policies with identity-aware ones.
drop policy if exists "Public can read orders" on orders;
drop policy if exists "Public can insert orders" on orders;

-- A customer (anonymous auth user) can only read rows they placed.
-- An admin (a REAL email/password user, i.e. NOT anonymous) can read all.
-- Requests with no session at all (auth.role() = 'anon') are denied by
-- both branches below — only a real Supabase session (anonymous or admin)
-- gets any access.
create policy "Customers read own orders, admins read all"
  on orders for select
  using (
    (auth.uid() is not null and auth.uid() = user_id)
    or (
      auth.role() = 'authenticated'
      and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );

-- Anyone with a real session (including anonymous customers) can insert an
-- order, but only tagged with their OWN uid — they can't plant an order
-- under someone else's identity, and a request with no session can't
-- insert at all since auth.uid() would be null.
create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

-- Only a REAL admin (not an anonymous customer session) can change price/status.
drop policy if exists "Authenticated users can update orders" on orders;
create policy "Only real admins can update orders"
  on orders for update
  to authenticated
  using (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

drop policy if exists "Authenticated users can delete orders" on orders;
create policy "Only real admins can delete orders"
  on orders for delete
  to authenticated
  using (coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
