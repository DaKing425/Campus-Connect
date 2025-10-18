// Club-related types
export interface Club {
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
  // Extended fields for UI
  members?: ClubMember[]
  events?: Event[]
  interests?: Interest[]
  follower_count?: number
  is_following?: boolean
}

export interface ClubMember {
  club_id: string
  user_id: string
  role: 'owner' | 'officer' | 'member'
  joined_at: string
  updated_at: string
  // Extended fields
  user?: User
}

export interface ClubFormData {
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
