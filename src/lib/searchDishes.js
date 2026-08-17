/**
 * Normalize and match dishes for search.
 * Searches English name, Hindi name, description — case-insensitive.
 */
export function normalizeQuery(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function dishMatchesQuery(dish, rawQuery) {
  const q = normalizeQuery(rawQuery)
  if (!q) return true

  const name = (dish.name || '').toLowerCase()
  const nameHi = (dish.nameHi || '').toLowerCase()
  const desc = (dish.description || '').toLowerCase()
  const sub = (dish.subcategory || '').toLowerCase().replace(/-/g, ' ')

  // Token match: every word in query should appear somewhere
  const tokens = q.split(' ').filter(Boolean)
  return tokens.every(
    (tok) =>
      name.includes(tok) ||
      nameHi.includes(tok) ||
      desc.includes(tok) ||
      sub.includes(tok)
  )
}

export function filterAndSortDishes(dishes, { query, vegOnly, sortBy, subcategoryId }) {
  let list = Array.isArray(dishes) ? [...dishes] : []

  if (subcategoryId && subcategoryId !== 'all') {
    list = list.filter((d) => d.subcategory === subcategoryId)
  }

  if (query && normalizeQuery(query)) {
    list = list.filter((d) => dishMatchesQuery(d, query))
  }

  if (vegOnly) list = list.filter((d) => d.veg)

  if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
  else if (sortBy === 'rating') list.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
  else if (query && normalizeQuery(query)) {
    // Relevance: name starts-with first, then includes
    const q = normalizeQuery(query)
    list.sort((a, b) => {
      const an = (a.name || '').toLowerCase()
      const bn = (b.name || '').toLowerCase()
      const as = an.startsWith(q) ? 0 : an.includes(q) ? 1 : 2
      const bs = bn.startsWith(q) ? 0 : bn.includes(q) ? 1 : 2
      if (as !== bs) return as - bs
      return an.localeCompare(bn)
    })
  }

  return list
}
