import { createClient } from '@supabase/supabase-js'

const ACTIVE_SUPABASE_URL = 'https://apeczjxewxaplosktkuz.supabase.co'
const ACTIVE_SUPABASE_ANON_KEY =
  'sb_publishable_SDjJypHUw9FTvySi83AArg_iiT7NLqG'

const envUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const envKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

// Guard against deprecated/uninitialized Supabase project refs in deployment env vars
const useActiveProject =
  !envUrl ||
  !envKey ||
  envUrl.includes('your-project-id') ||
  envUrl.includes('ymievrlmufwjbggyytvn') ||
  envKey.includes('s5etfFXR65gTeSIIj2M58w')

export const supabaseUrl = useActiveProject ? ACTIVE_SUPABASE_URL : envUrl
export const supabaseKey = useActiveProject ? ACTIVE_SUPABASE_ANON_KEY : envKey

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

