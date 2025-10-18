// API request/response types
export interface CreateEventRequest {
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

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
}

export interface CreateClubRequest {
  name: string
  description: string
  contact_email: string
  website_url?: string
  instagram_url?: string
  discord_url?: string
  profile_image_url?: string
  cover_image_url?: string
  visibility: 'public' | 'campus_only'
  interest_ids: string[]
}

export interface UpdateClubRequest extends Partial<CreateClubRequest> {
  id: string
}

export interface RSVPRequest {
  event_id: string
  status: 'going' | 'interested'
}

export interface CancelRSVPRequest {
  event_id: string
}

export interface FollowClubRequest {
  club_id: string
}

export interface UnfollowClubRequest {
  club_id: string
}

export interface UpdateProfileRequest {
  display_name?: string
  avatar_url?: string
  consent_personalization?: boolean
  consent_share_major?: boolean
  major?: string
  class_year?: number
  interest_ids?: string[]
}

export interface SearchRequest {
  query: string
  filters?: {
    categories?: string[]
    interests?: string[]
    clubs?: string[]
    date_range?: {
      start: string
      end: string
    }
    location?: 'on_campus' | 'off_campus' | 'virtual'
    accessibility_features?: string[]
  }
  page?: number
  limit?: number
}

export interface AdminModerationRequest {
  entity_type: 'event' | 'club' | 'profile'
  entity_id: string
  action: 'approve' | 'reject' | 'suspend' | 'unsuspend'
  reason?: string
  notes?: string
}

export interface ReportContentRequest {
  entity_type: 'event' | 'club' | 'profile' | 'comment'
  entity_id: string
  reason: string
}

// AI Integration types
export interface AIRecommendationRequest {
  user_id: string
  limit?: number
  include_explanations?: boolean
}

export interface AIRecommendation {
  event: Event
  score: number
  explanation?: string
}

export interface AISummarizationRequest {
  content: string
  type: 'event_description' | 'club_description'
}

export interface AISummarizationResponse {
  summary: string
  suggested_tags: string[]
  suggested_category: string
}

export interface AIModerationRequest {
  content: string
  content_type: 'event_title' | 'event_description' | 'club_description'
}

export interface AIModerationResponse {
  is_appropriate: boolean
  confidence: number
  flagged_reasons: string[]
  suggested_changes?: string
}
