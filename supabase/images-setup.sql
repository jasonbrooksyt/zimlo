-- Zimlo — adds real dish photos + description support.
-- Run this in the Supabase SQL Editor (after schema.sql / seed.sql already ran).

-- New columns on the existing dishes table.
-- image_url: public URL of an uploaded photo (null = show the emoji instead, unchanged behaviour)
-- description: short dish description shown under the name (optional)
alter table dishes add column if not exists image_url text;
alter table dishes add column if not exists description text;

-- Storage bucket for dish photos, publicly readable (so customers' browsers
-- can load images) but only writable by a signed-in admin.
insert into storage.buckets (id, name, public)
values ('dish-images', 'dish-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view dish images" on storage.objects;
create policy "Public can view dish images"
  on storage.objects for select
  using (bucket_id = 'dish-images');

drop policy if exists "Authenticated users can upload dish images" on storage.objects;
create policy "Authenticated users can upload dish images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dish-images');

drop policy if exists "Authenticated users can update dish images" on storage.objects;
create policy "Authenticated users can update dish images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dish-images');

drop policy if exists "Authenticated users can delete dish images" on storage.objects;
create policy "Authenticated users can delete dish images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dish-images');
