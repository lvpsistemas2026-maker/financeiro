import { createClient } from '@supabase/supabase-js'

// Usa placeholder válido para evitar crash durante build/dev sem credenciais configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// Cliente para uso no browser (client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente com service role para server actions (bypassa RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { persistSession: false } }
)
