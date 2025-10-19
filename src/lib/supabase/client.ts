import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://embxqyhzncdvavwctbtw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYnhxeWh6bmNkdmF2d2N0YnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTE1NTUsImV4cCI6MjA3NjM4NzU1NX0.0KRNOo6G47TBmUKa_1MUUGu_0lK5-Y8SxKtFyTzy7vA'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
