// DATABASE TYPES for Supabase
// Generated types for type-safe database operations
// You can generate these using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_categories: {
        Row: {
          id: string
          name: string
          type: 'numeric' | 'scale' | 'boolean'
          min: number | null
          max: number | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'numeric' | 'scale' | 'boolean'
          min?: number | null
          max?: number | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'numeric' | 'scale' | 'boolean'
          min?: number | null
          max?: number | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_entries: {
        Row: {
          id: string
          date: string
          sleep_hours: number
          sleep_quality: number
          exercise: boolean
          exercise_time: number | null
          alcohol: boolean
          alcohol_units: number | null
          cannabis: boolean
          cannabis_amount: number | null
          meditation: boolean
          meditation_time: number | null
          social_time: number | null
          work_hours: number | null
          stress_level: number
          happiness_rating: number
          meals: number | null
          food_quality: number | null
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date?: string
          sleep_hours: number
          sleep_quality: number
          exercise?: boolean
          exercise_time?: number | null
          alcohol?: boolean
          alcohol_units?: number | null
          cannabis?: boolean
          cannabis_amount?: number | null
          meditation?: boolean
          meditation_time?: number | null
          social_time?: number | null
          work_hours?: number | null
          stress_level: number
          happiness_rating: number
          meals?: number | null
          food_quality?: number | null
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          sleep_hours?: number
          sleep_quality?: number
          exercise?: boolean
          exercise_time?: number | null
          alcohol?: boolean
          alcohol_units?: number | null
          cannabis?: boolean
          cannabis_amount?: number | null
          meditation?: boolean
          meditation_time?: number | null
          social_time?: number | null
          work_hours?: number | null
          stress_level?: number
          happiness_rating?: number
          meals?: number | null
          food_quality?: number | null
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      custom_category_entries: {
        Row: {
          id: string
          value: number
          daily_entry_id: string
          custom_category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          value: number
          daily_entry_id: string
          custom_category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          value?: number
          daily_entry_id?: string
          custom_category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      gratitudes: {
        Row: {
          id: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

