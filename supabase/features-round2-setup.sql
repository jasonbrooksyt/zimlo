-- Zimlo — Round 2 features: real dish ratings, profile photos, and photo
-- attachments on Bakery/Grocery/Medicine/Parcel/Custom requests.
-- Run in Supabase SQL Editor (after orders-privacy-setup.sql).

-- ===== 1. Real dish ratings (replaces the old fake/deterministic ones) =====
create table if not exists dish_ratings (
  id uuid primary key default gen_random_uuid(),
  dish_id text not null,
  order_id text references orders(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now(),
  unique (dish_id, order_id, user_id) -- one rating per dish per order
);

alter table dish_ratings enable row level security;

drop policy if exists "Public can read ratings" on dish_ratings;
create policy "Public can read ratings"
  on dish_ratings for select
  using (true);

drop policy if exists "Users can rate their own orders" on dish_ratings;
create policy "Users can rate their own orders"
  on dish_ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ratings" on dish_ratings;
create policy "Users can update their own ratings"
  on dish_ratings for update
  using (auth.uid() = user_id);

alter publication supabase_realtime add table dish_ratings;

-- ===== 2. Profile photos (Supabase Storage bucket) =====
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view profile photos" on storage.objects;
create policy "Public can view profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

drop policy if exists "Users can upload profile photos" on storage.objects;
create policy "Users can upload profile photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-photos');

drop policy if exists "Users can update profile photos" on storage.objects;
create policy "Users can update profile photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-photos');

-- ===== 3. Photo attachments on requests (Bakery/Grocery/Medicine/Parcel/Custom) =====
alter table orders add column if not exists attachment_url text;

insert into storage.buckets (id, name, public)
values ('request-attachments', 'request-attachments', true)
on conflict (id) do nothing;

drop policy if exists "Public can view request attachments" on storage.objects;
create policy "Public can view request attachments"
  on storage.objects for select
  using (bucket_id = 'request-attachments');

drop policy if exists "Users can upload request attachments" on storage.objects;
create policy "Users can upload request attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'request-attachments');
