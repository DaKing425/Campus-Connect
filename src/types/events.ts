// Event-related types
export interface Event {
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
  // Extended fields for UI
  club?: Club
  venue?: Venue
  categories?: Category[]
  interests?: Interest[]
  rsvp_count?: number
  user_rsvp?: RSVP
}

export interface EventFormData {
  title: string
  description: string
  start_time: string
  end_time: string
  timezone: string
  venue_id?: string
  virtual_url?: string
  capacity?: number
  is_waitlist_enabled: boolean
  rsvp_buffer: number
  rsvp_close_time?: string
  visibility: 'public' | 'campus_only' | 'private_link'
  image_url?: string
  category_ids: string[]
  interest_ids: string[]
}

export interface EventFilters {
  categories?: string[]
  interests?: string[]
  clubs?: string[]
  date_range?: {
    start: string
    end: string
  }
  location?: 'on_campus' | 'off_campus' | 'virtual'
  accessibility_features?: string[]
  search_query?: string
}
