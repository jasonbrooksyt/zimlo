// Zimlo — prerenders the public, unauthenticated routes to static HTML.
//
// Runs after both the client build (dist/) and SSR build (dist-ssr/) exist
// — see the `build` script in package.json, which runs these in order:
//   1. vite build                          -> dist/ (the real SPA bundle)
//   2. vite build --ssr src/entry-server.jsx -> dist-ssr/entry-server.js
//   3. node scripts/prerender.mjs          -> writes dist/<route>/index.html
//
// Vercel serves a static file at a matching path BEFORE it applies the
// vercel.json SPA rewrite (`rewrites` only kick in when no file exists at
// that path) — see vercel.json's comment. So /food gets the prerendered
// dist/food/index.html directly; any route NOT in ROUTES below still falls
// through to the normal index.html + client-rendered SPA, unchanged.
//
// Deliberately NOT prerendered: anything behind login (Checkout, Orders,
// Profile, Addresses), Admin, and per-category dish lists (/food/:subId —
// dynamic, and the menu changes live from the admin dashboard, so a stale
// prerendered snapshot would be actively misleading). Those keep working
// exactly as before, pure client-rendered.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distDir = resolve(root, 'dist')

const ROUTES = ['/', '/home', '/food', '/services', '/about', '/contact']

async function main() {
  const template = await readFile(resolve(distDir, 'index.html'), 'utf-8')
  const { render } = await import(resolve(root, 'dist-ssr/entry-server.js'))

  for (const url of ROUTES) {
    let appHtml, meta
    try {
      ;({ html: appHtml, meta } = render(url))
    } catch (err) {
      // A route that can't prerender (e.g. it genuinely needs browser-only
      // state) should not break the whole build — it just falls back to
      // being plain client-rendered, same as before this change.
      console.warn(`[prerender] skipped ${url}: ${err.message}`)
      continue
    }

    let html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    )

    if (meta) {
      const canonicalUrl = `https://www.zimlo.in${url === '/' ? '/' : url}`
      html = html
        .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
        .replace(
          /<meta name="description" content="[^"]*" \/>/,
          `<meta name="description" content="${meta.description}" />`
        )
        .replace(
          /<link rel="canonical" href="[^"]*" \/>/,
          `<link rel="canonical" href="${canonicalUrl}" />`
        )
        .replace(
          /<meta property="og:title" content="[^"]*" \/>/,
          `<meta property="og:title" content="${meta.title}" />`
        )
        .replace(
          /<meta property="og:description" content="[^"]*" \/>/,
          `<meta property="og:description" content="${meta.description}" />`
        )
        .replace(
          /<meta property="og:url" content="[^"]*" \/>/,
          `<meta property="og:url" content="${canonicalUrl}" />`
        )
        .replace(
          /<meta name="twitter:title" content="[^"]*" \/>/,
          `<meta name="twitter:title" content="${meta.title}" />`
        )
        .replace(
          /<meta name="twitter:description" content="[^"]*" \/>/,
          `<meta name="twitter:description" content="${meta.description}" />`
        )
    }

    const outPath = url === '/'
      ? resolve(distDir, 'index.html')
      : resolve(distDir, `.${url}`, 'index.html')

    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html)
    console.log(`[prerender] wrote ${outPath.replace(root + '/', '')}`)
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
