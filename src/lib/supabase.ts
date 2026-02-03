import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Only create the client if the environment variables are available and valid
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase_url')) {
      return null
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn('Supabase client failed to initialize:', error)
    return null
  }
})()