-- Zimlo — makes Food subcategories (Fast Food, North Indian, etc.) admin
-- editable instead of hardcoded in the app. Run in Supabase SQL Editor.

create table if not exists subcategories (
  id text primary key,
  name text not null,
  name_hi text not null,
  emoji text not null default '🍽️',
  color text not null default '#FF9800',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table subcategories enable row level security;

drop policy if exists "Public can read subcategories" on subcategories;
create policy "Public can read subcategories"
  on subcategories for select
  using (true);

drop policy if exists "Authenticated users can insert subcategories" on subcategories;
create policy "Authenticated users can insert subcategories"
  on subcategories for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update subcategories" on subcategories;
create policy "Authenticated users can update subcategories"
  on subcategories for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete subcategories" on subcategories;
create policy "Authenticated users can delete subcategories"
  on subcategories for delete
  to authenticated
  using (true);

alter publication supabase_realtime add table subcategories;

-- Seed with the 11 subcategories the app already ships with.
insert into subcategories (id, name, name_hi, emoji, color, sort_order) values
('fast-food', 'Fast Food', 'फास्ट फूड', '🍔', '#FF9800', 1),
('north-indian', 'North Indian', 'उत्तर भारतीय', '🍛', '#E64A19', 2),
('south-indian', 'South Indian', 'दक्षिण भारतीय', '🥞', '#4CAF50', 3),
('chinese', 'Chinese', 'चाइनीज़', '🍜', '#F44336', 4),
('bakery-items', 'Bakery Items', 'बेकरी आइटम', '🍰', '#FFC107', 5),
('beverages', 'Beverages', 'पेय पदार्थ', '🥤', '#03A9F4', 6),
('pizza', 'Pizza', 'पिज़्ज़ा', '🍕', '#FF5722', 7),
('rolls-wraps', 'Rolls & Wraps', 'रोल्स और रैप्स', '🌯', '#8BC34A', 8),
('thali', 'Thali & Combos', 'थाली और कॉम्बो', '🍱', '#9C27B0', 9),
('street-food', 'Street Food', 'स्ट्रीट फूड', '🥟', '#FF6F00', 10),
('desserts', 'Desserts & Sweets', 'मिठाई', '🍨', '#EC407A', 11)
on conflict (id) do nothing;
