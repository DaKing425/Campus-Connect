import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) }
  }
}

export function getSupabaseClient(): SupabaseClient<Database> {
  const { supabase } = require('./client')
  return supabase
}
