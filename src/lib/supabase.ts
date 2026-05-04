import { createClient } from '@supabase/supabase-js'

// Hardcoding for verification of "2026 Supabase" keys
const supabaseUrl = 'https://lvknkrqnnimxvhfjuzku.supabase.co'
const supabaseAnonKey = 'sb_publishable_RKWuQq8tDS1q2BQsWVp14w_PvEIcx7l'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
