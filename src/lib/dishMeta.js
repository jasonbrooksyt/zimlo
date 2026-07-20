// Deterministic "fake but consistent" rating + bestseller/trending tags
// derived from a dish's id, so the same dish always shows the same
// rating/tag across renders without needing extra fields in menuData.js.
// Replace with real rating aggregation once orders/reviews exist.

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
  const rating = (3.6 + (h % 14) / 10).toFixed(1) // 3.6 - 4.9
  const ratingCount = 50 + (h % 950) // 50 - 999
  const isBestseller = h % 6 === 0
  const isTrending = !isBestseller && h % 9 === 0
  const prepMinutes = 15 + (h % 20) // 15-34 min
  return { rating, ratingCount, isBestseller, isTrending, prepMinutes }
}
