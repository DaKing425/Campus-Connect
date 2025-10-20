// Common utility types
// Note: lightweight UI helper types are declared locally to avoid circular imports
export interface Category {
  id: string
  name: string
  slug: string
}

export interface Interest {
  id: string
  name: string
  slug: string
}

export interface Venue {
  id: string
  name: string
  room_number: string | null
  address: string | null
  latitude?: number | null
  longitude?: number | null
  map_url?: string | null
  accessibility_features?: string[] | null
  capacity?: number | null
  is_accessible?: boolean
  created_at: string
  updated_at: string
}

export interface RSVP {
  id: string
  user_id: string
  event_id: string
  status: 'going' | 'interested' | 'waitlisted' | 'cancelled'
  rsvp_time: string
  cancelled_at: string | null
  waitlist_position: number | null
  promotion_expires_at: string | null
  // Extended fields
  user?: User
  event?: Event
}

export interface Notification {
  id: string
  user_id: string
  type: 'event_update' | 'waitlist_promotion' | 'rsvp_reminder' | 'club_post' | 'report_status' | 'admin_message'
  title: string
  body: string | null
  entity_type: 'event' | 'club' | 'report' | null
  entity_id: string | null
  read_at: string | null
  delivered_at: string | null
  created_at: string
}

/* AuditLog and Report are defined below with UI helper fields */

// Add optional reporter/actor fields and expose lightweight User helper
export interface User {
  id: string
  display_name?: string
}

export interface Report {
  id: string
  reporter_id: string
  entity_type: 'event' | 'club' | 'profile' | 'comment'
  entity_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  moderator_id: string | null
  moderator_notes: string | null
  created_at: string
  updated_at: string
  reporter?: User
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string
  details: any
  ip_address: string
  created_at: string
  actor?: User
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T = any> {
  data: T
  errors: ValidationError[]
  isSubmitting: boolean
  isDirty: boolean
}

// Re-export Event type so other files that import from '@/types/common' can access it
export type { Event } from './events'
