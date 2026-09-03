import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  // createClient() throws on an empty URL, so fall back to a harmless
  // placeholder that lets the app boot — calls will just fail with a
  // network error until real values are set. Copy .env.example to .env
  // and fill these in from your Supabase project's API settings.
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not set. ' +
    'Copy .env.example to .env and fill them in from your Supabase project settings.'
  )
}

// The publishable/anon key is safe to ship in client code by design — it's
// what RLS policies exist to protect against, never a secret. The
// service-role key must never appear here or anywhere else client-side.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
)
