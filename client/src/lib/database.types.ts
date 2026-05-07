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
      user_profiles: {
        Row: {
          id: string
          name: string
          role: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          target_audience: string
          brand_tone: string | null
          launch_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          target_audience?: string
          brand_tone?: string | null
          launch_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          target_audience?: string
          brand_tone?: string | null
          launch_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      content_assets: {
        Row: {
          id: string
          project_id: string
          type: string
          content: string
          angle: string | null
          tone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          content: string
          angle?: string | null
          tone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          content?: string
          angle?: string | null
          tone?: string | null
          created_at?: string
        }
      }
      visual_generations: {
        Row: {
          id: string
          project_id: string
          prompt: string
          image_url: string
          style: string
          ratio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          prompt: string
          image_url: string
          style: string
          ratio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          prompt?: string
          image_url?: string
          style?: string
          ratio?: string | null
          created_at?: string
        }
      }
      automations: {
        Row: {
          id: string
          project_id: string
          type: string
          config_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          config_json?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          config_json?: Json
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
