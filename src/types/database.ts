// Core database types for CampusConnect
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          role: 'student' | 'club_admin' | 'campus_admin' | 'super_admin'
          consent_personalization: boolean
          consent_share_major: boolean
          major: string | null
          class_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          role?: 'student' | 'club_admin' | 'campus_admin' | 'super_admin'
          consent_personalization?: boolean
          consent_share_major?: boolean
          major?: string | null
          class_year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          role?: 'student' | 'club_admin' | 'campus_admin' | 'super_admin'
          consent_personalization?: boolean
          consent_share_major?: boolean
          major?: string | null
          class_year?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          contact_email: string | null
          website_url: string | null
          instagram_url: string | null
          discord_url: string | null
          profile_image_url: string | null
          cover_image_url: string | null
          visibility: 'public' | 'campus_only'
          status: 'pending' | 'approved' | 'suspended' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          contact_email?: string | null
          website_url?: string | null
          instagram_url?: string | null
          discord_url?: string | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          visibility?: 'public' | 'campus_only'
          status?: 'pending' | 'approved' | 'suspended' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          contact_email?: string | null
          website_url?: string | null
          instagram_url?: string | null
          discord_url?: string | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          visibility?: 'public' | 'campus_only'
          status?: 'pending' | 'approved' | 'suspended' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          club_id: string | null
          title: string
          slug: string
          summary: string | null
          description: string | null
          start_time: string
          end_time: string
          timezone: string
          venue_id: string | null
          virtual_url: string | null
          capacity: number | null
          is_waitlist_enabled: boolean
          rsvp_buffer: number
          rsvp_close_time: string | null
          visibility: 'public' | 'campus_only' | 'private_link'
          status: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed' | 'archived'
          image_url: string | null
          ical_uid: string | null
          recurrence_rule_id: string | null
          parent_event_id: string | null
          created_by: string
          created_at: string
          updated_at: string
          approved_at: string | null
          approved_by: string | null
          version: number
          source_id: string | null
        }
        Insert: {
          id?: string
          club_id?: string | null
          title: string
          slug: string
          summary?: string | null
          description?: string | null
          start_time: string
          end_time: string
          timezone?: string
          venue_id?: string | null
          virtual_url?: string | null
          capacity?: number | null
          is_waitlist_enabled?: boolean
          rsvp_buffer?: number
          rsvp_close_time?: string | null
          visibility?: 'public' | 'campus_only' | 'private_link'
          status?: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed' | 'archived'
          image_url?: string | null
          ical_uid?: string | null
          recurrence_rule_id?: string | null
          parent_event_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          approved_by?: string | null
          version?: number
          source_id?: string | null
        }
        Update: {
          id?: string
          club_id?: string | null
          title?: string
          slug?: string
          summary?: string | null
          description?: string | null
          start_time?: string
          end_time?: string
          timezone?: string
          venue_id?: string | null
          virtual_url?: string | null
          capacity?: number | null
          is_waitlist_enabled?: boolean
          rsvp_buffer?: number
          rsvp_close_time?: string | null
          visibility?: 'public' | 'campus_only' | 'private_link'
          status?: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed' | 'archived'
          image_url?: string | null
          ical_uid?: string | null
          recurrence_rule_id?: string | null
          parent_event_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          approved_by?: string | null
          version?: number
          source_id?: string | null
        }
      }
      rsvps: {
        Row: {
          id: string
          user_id: string
          event_id: string
          status: 'going' | 'interested' | 'waitlisted' | 'cancelled'
          rsvp_time: string
          cancelled_at: string | null
          waitlist_position: number | null
          promotion_expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          status?: 'going' | 'interested' | 'waitlisted' | 'cancelled'
          rsvp_time?: string
          cancelled_at?: string | null
          waitlist_position?: number | null
          promotion_expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          status?: 'going' | 'interested' | 'waitlisted' | 'cancelled'
          rsvp_time?: string
          cancelled_at?: string | null
          waitlist_position?: number | null
          promotion_expires_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      interests: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          room_number: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          map_url: string | null
          accessibility_features: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          room_number?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          accessibility_features?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          room_number?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          accessibility_features?: any | null
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
