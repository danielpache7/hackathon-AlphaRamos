import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with fallback values for build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Vote {
  id: string
  judge_name: string
  squad_id: string
  scores: Record<string, number>
  created_at: string
}

export interface VotingSettings {
  id: string
  voting_status: 'OPEN' | 'CLOSED'
  updated_at: string
}