-- Zimlo — closes the price-tampering hole.
--
-- PROBLEM: orders are inserted directly from the browser (supabase-js),
-- and every number on the order (item prices, subtotal, discount, delivery
-- fee, total) currently comes from client-side zustand state. RLS only
-- checks WHO is inserting (their own user_id) — it never checks WHETHER
-- the numbers they're inserting are real. Anyone with devtools can edit
-- the cart price before checkout and pay ₹1 for a ₹500 order.
--
-- FIX: a BEFORE INSERT trigger that ignores the submitted subtotal/total
-- entirely and recomputes them server-side from the `dishes` and `coupons`
-- tables (the only things the browser can't rewrite), then rejects the
-- insert if the client's numbers don't match. Combined with
-- api/create-razorpay-order.js (recomputes the Razorpay charge amount the
-- same way) this closes it for both COD and online payment — Razorpay
-- charges the real amount, and even if that were bypassed, the DB insert
-- itself is rejected.
--
-- Run this AFTER schema.sql, orders-setup.sql, orders-privacy-setup.sql,
-- and coupons-setup.sql (it depends on all four tables/columns).
--
-- KNOWN GAP (documented, not silently ignored): the one-time referral
-- delivery-fee discount (₹20) is tracked only in the browser
-- (localStorage `zimlo_referral_pending`) — there's no server record of
-- who was actually referred. This trigger allows the discounted delivery
-- fee ONLY on a customer's genuine first order (checked server-side by
-- phone number), which stops a repeat customer from claiming it forever,
-- but it can't stop a never-referred customer from claiming it once. Max
-- exposure is ₹20/customer. Closing this fully needs a server-recorded
-- referral flag (e.g. a `referred_by` column set at signup) — flagging
-- as a separate follow-up rather than pretending this trigger solves it.

create or replace function validate_order_pricing()
returns trigger as $$
declare
  item jsonb;
  item_id text;
  item_qty integer;
  real_price integer;
  computed_subtotal integer := 0;
  coupon record;
  computed_discount integer := 0;
  base_delivery_fee constant integer := 39;   -- DELIVERY_FEE in src/data/menuData.js
  free_threshold constant integer := 1000;    -- FREE_DELIVERY_THRESHOLD
  referral_discount constant integer := 20;   -- REFERRAL_DELIVERY_DISCOUNT
  cod_fee_const constant integer := 20;        -- COD_FEE
  computed_delivery_fee integer;
  computed_cod_fee integer;
  computed_total integer;
  is_first_order boolean;
  min_delivery_fee integer; -- lowest fee we'll accept (accounts for a legit referral claim)
begin
  -- Only food orders carry a priced item list today. Other order types
  -- (grocery/parcel/custom/services) are unpriced requests quoted manually
  -- by an admin after the fact, so they're out of scope for this check.
  if new.type <> 'food' then
    return new;
  end if;

  if new.items is null or jsonb_array_length(new.items) = 0 then
    raise exception 'Zimlo pricing check: order has no items';
  end if;

  -- Recompute subtotal from real dish prices, not the client's copy.
  for item in select * from jsonb_array_elements(new.items)
  loop
    item_id := item->>'id';
    item_qty := (item->>'qty')::integer;

    if item_id is null or item_qty is null or item_qty < 1 then
      raise exception 'Zimlo pricing check: malformed cart item';
    end if;

    select price into real_price from dishes where id = item_id;
    if real_price is null then
      raise exception 'Zimlo pricing check: unknown dish id %', item_id;
    end if;

    computed_subtotal := computed_subtotal + real_price * item_qty;
  end loop;

  -- Recompute coupon discount from the real coupon row, not the client's copy.
  if new.coupon_code is not null then
    select * into coupon from coupons where code = new.coupon_code and active = true;
    if coupon is null then
      raise exception 'Zimlo pricing check: invalid or inactive coupon %', new.coupon_code;
    end if;
    if computed_subtotal < coupon.min_order then
      raise exception 'Zimlo pricing check: order does not meet coupon minimum';
    end if;
    if coupon.type = 'flat' then
      computed_discount := coupon.value;
    else
      computed_discount := round(computed_subtotal * coupon.value / 100.0);
      if coupon.max_discount is not null then
        computed_discount := least(computed_discount, coupon.max_discount);
      end if;
    end if;
  end if;

  -- Delivery fee: free above threshold, otherwise the flat fee, minus the
  -- referral discount IF this is genuinely this phone's first order.
  if computed_subtotal >= free_threshold then
    computed_delivery_fee := 0;
    min_delivery_fee := 0;
  else
    select not exists (
      select 1 from orders
      where customer_phone = new.customer_phone and type = 'food'
    ) into is_first_order;

    computed_delivery_fee := base_delivery_fee;
    min_delivery_fee := case when is_first_order
      then greatest(base_delivery_fee - referral_discount, 0)
      else base_delivery_fee
    end;
  end if;

  computed_cod_fee := case when new.payment_method = 'cod' then cod_fee_const else 0 end;

  if new.subtotal is distinct from computed_subtotal then
    raise exception 'Zimlo pricing check: subtotal mismatch (got %, expected %)',
      new.subtotal, computed_subtotal;
  end if;

  if new.discount is distinct from computed_discount then
    raise exception 'Zimlo pricing check: discount mismatch (got %, expected %)',
      new.discount, computed_discount;
  end if;

  if new.delivery_fee < min_delivery_fee or new.delivery_fee > computed_delivery_fee then
    raise exception 'Zimlo pricing check: delivery fee mismatch (got %, expected between % and %)',
      new.delivery_fee, min_delivery_fee, computed_delivery_fee;
  end if;

  if new.cod_fee is distinct from computed_cod_fee then
    raise exception 'Zimlo pricing check: COD fee mismatch (got %, expected %)',
      new.cod_fee, computed_cod_fee;
  end if;

  computed_total := greatest(computed_subtotal - computed_discount, 0) + new.delivery_fee + computed_cod_fee;
  if new.total is distinct from computed_total then
    raise exception 'Zimlo pricing check: total mismatch (got %, expected %)',
      new.total, computed_total;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_validate_order_pricing on orders;
create trigger trg_validate_order_pricing
  before insert on orders
  for each row execute function validate_order_pricing();
