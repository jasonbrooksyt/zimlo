-- Zimlo — adds `orders` columns that src/store/useStore.js writes to on
-- almost every core action, but that no existing migration file actually
-- creates. Against the schema as shipped (schema.sql + orders-setup.sql +
-- orders-privacy-setup.sql + features-round2-setup.sql), these calls would
-- all fail with "column does not exist":
--   - placeFoodOrder()  -> insert .paid, .razorpay_order_id, .razorpay_payment_id
--   - setOrderPrice()   -> update .admin_note, .quote_accepted
--   - acceptQuote()     -> update .quote_accepted
--   - markOrderPaid()   -> update .paid, .razorpay_order_id, .razorpay_payment_id
--
-- i.e. placing any food order, quoting a request, accepting a quote, and
-- recording a request payment were all broken against this schema.
--
-- Run this in Supabase SQL Editor (after orders-setup.sql).

alter table orders add column if not exists paid boolean not null default false;
alter table orders add column if not exists razorpay_order_id text;
alter table orders add column if not exists razorpay_payment_id text;
alter table orders add column if not exists admin_note text;
alter table orders add column if not exists quote_accepted boolean not null default false;
