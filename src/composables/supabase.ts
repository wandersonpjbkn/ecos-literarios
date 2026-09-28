import { createClient } from '@supabase/supabase-js'

// One client for the app: useAuth signs in and out with it, useApi reads and renews the token through it.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
)
