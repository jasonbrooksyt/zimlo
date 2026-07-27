// Deterministic "fake but consistent" bestseller/trending tags + prep-time
// estimate, derived from a dish's id so the same dish always shows the
// same tag/time across renders without extra fields in menuData.js.
//
// NOTE: this used to also generate a fake star rating — that's gone now.
// Real ratings (customers rating their delivered orders) live in
// Supabase's `dish_ratings` table and are merged onto each dish object
// by useDishes.js as `avgRating` / `ratingCount`.

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getDishMeta(dish) {
  const h = hashString(dish.id)
  const isBestseller = h % 6 === 0
  const isTrending = !isBestseller && h % 9 === 0
  const prepMinutes = 15 + (h % 20) // 15-34 min
  return { isBestseller, isTrending, prepMinutes }
}
