export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      alert_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          conditions: string[]
          statuses: string[]
          country: string
          phases: string[] | null
          sponsor_types: string[] | null
          email: string
          frequency: string
          active: boolean
          created_at: string
          last_synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          conditions: string[]
          statuses?: string[]
          country?: string
          phases?: string[] | null
          sponsor_types?: string[] | null
          email: string
          frequency?: string
          active?: boolean
        }
        Update: Partial<Database['public']['Tables']['alert_profiles']['Insert']>
      }
      trial_snapshots: {
        Row: {
          id: string
          profile_id: string
          nct_id: string
          snapshot: Json
          first_seen: string
          last_seen: string
          status_at_snapshot: string
        }
        Insert: {
          profile_id: string
          nct_id: string
          snapshot: Json
          status_at_snapshot: string
        }
        Update: {
          snapshot?: Json
          last_seen?: string
          status_at_snapshot?: string
        }
      }
      digest_log: {
        Row: {
          id: string
          profile_id: string
          sent_at: string
          new_trials_count: number
          changed_trials_count: number
          email_sent_to: string
        }
        Insert: {
          profile_id: string
          new_trials_count: number
          changed_trials_count: number
          email_sent_to: string
        }
      }
    }
  }
}

export type AlertProfile = Database['public']['Tables']['alert_profiles']['Row']
export type TrialSnapshot = Database['public']['Tables']['trial_snapshots']['Row']
