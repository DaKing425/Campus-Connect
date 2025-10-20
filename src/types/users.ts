// User-related types
import type { Interest, RSVP } from './common'
import type { ClubMember } from './clubs'
export interface User {
  id: string
  email?: string
  display_name?: string
  first_name?: string
  last_name?: string
  role?: 'student' | 'club_admin' | 'campus_admin' | 'super_admin'
  graduation_year?: number | null
  major?: string | null
  bio?: string | null
  avatar_url?: string | null
  is_public?: boolean
  allow_personalization?: boolean
  created_at?: string
  last_sign_in_at?: string | null
  updated_at?: string
}

export interface Profile {
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
  // Extended fields
  user?: User
  interests?: Interest[]
  rsvps?: RSVP[]
  club_memberships?: ClubMember[]
}

export interface UserFormData {
  display_name: string
  avatar_url?: string
  consent_personalization: boolean
  consent_share_major: boolean
  major?: string
  class_year?: number
  interest_ids: string[]
}
