import { createClient } from '@supabase/supabase-js'

// Zimlo — Supabase client.
// Reads connection details from Vite env vars, set in a local .env file
// (see .env.example) and in Vercel Project Settings -> Environment Variables.
// If these aren't set (e.g. a fresh clone before setup), isSupabaseConfigured
// is false and the app falls back to the bundled static menu data instead
// of crashing — see src/hooks/useDishes.js.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Zimlo] Supabase env vars missing — using local demo menu data. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live menu editing.'
  )
}
