// Generates supabase/seed.sql from the existing demo dishes in
// src/data/menuData.js, so the Supabase `dishes` table starts out with
// the exact same 117-item catalogue the app already ships with.
import { DISHES } from '../src/data/menuData.js'
import { writeFileSync } from 'fs'

const esc = (s) => String(s).replace(/'/g, "''")

const rows = DISHES.map(
  (d) =>
    `('${esc(d.id)}', '${esc(d.subcategory)}', '${esc(d.name)}', '${esc(d.nameHi)}', ${d.price}, ${d.veg}, '${esc(d.img)}')`
).join(',\n')

const sql = `-- Zimlo — seed data generated from src/data/menuData.js
-- Run this in the Supabase SQL Editor AFTER schema.sql.
insert into dishes (id, subcategory, name, name_hi, price, veg, img) values
${rows}
on conflict (id) do nothing;
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log(`Wrote supabase/seed.sql with ${DISHES.length} dishes`)
