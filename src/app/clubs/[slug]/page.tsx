'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClubEventCard } from '@/components/clubs/ClubCard'
import { supabase } from '@/lib/supabase/client'
const sb = supabase as any
import { useAuth } from '@/hooks/useAuth'
import { Club, Event } from '@/types/clubs'
import { ArrowLeft, Users, Calendar, ExternalLink, Instagram, MessageCircle, Mail, Settings } from 'lucide-react'

export default function ClubDetailPage() {
  const params = useParams()
  const clubSlug = params.slug as string
  const { user, profile } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [following, setFollowing] = useState(false)

  // fetchClub is stable in this component scope; intentional to run when clubSlug changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchClub()
  }, [clubSlug])

  const fetchClub = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch club with related data
  const { data: clubData, error: clubError } = await sb
        .from('clubs')
        .select(`
          *,
          interests:club_interests(interest:interests(*)),
          members:club_members(user:profiles(*))
        `)
        .eq('slug', clubSlug)
        .eq('status', 'approved')
        .single()

      if (clubError) throw clubError

      // Transform the data
      const transformedClub = {
        ...clubData,
        interests: clubData.interests?.map((ci: any) => ci.interest).filter(Boolean) || [],
        members: clubData.members?.map((cm: any) => ({ ...cm, user: cm.user })) || [],
      }

      setClub(transformedClub)

      // Fetch club events
  const { data: eventsData, error: eventsError } = await sb
        .from('events')
        .select(`
          *,
          venue:venues(*),
          categories:event_categories(category:categories(*)),
          interests:event_interests(interest:interests(*))
        `)
        .eq('club_id', clubData.id)
        .eq('status', 'approved')
        .order('start_time', { ascending: true })

      if (!eventsError && eventsData) {
  const transformedEvents = eventsData.map((event: any) => ({
          ...event,
          categories: event.categories?.map((ec: any) => ec.category).filter(Boolean) || [],
          interests: event.interests?.map((ei: any) => ei.interest).filter(Boolean) || [],
        }))
        setEvents(transformedEvents)
      }

      // Check if user is following this club
      if (user) {
        const { data: followData } = await sb
          .from('follows')
          .select('*')
          .eq('user_id', user.id)
          .eq('club_id', clubData.id)
          .single()

        setFollowing(!!followData)
      }
    } catch (err) {
      console.error('Error fetching club:', err)
      setError(err instanceof Error ? err.message : 'Failed to load club')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return

    try {
      if (following) {
        const { error } = await sb
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('club_id', club!.id)

        if (error) throw error
        setFollowing(false)
      } else {
        const { error } = await sb
          .from('follows')
          .insert([{ user_id: user.id, club_id: club!.id }])

        if (error) throw error
        setFollowing(true)
      }
    } catch (err) {
      console.error('Error following/unfollowing club:', err)
    }
  }

  const isClubAdmin = club?.members?.some(
    member => member.user_id === user?.id && ['owner', 'officer'].includes(member.role)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-husky-purple mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading club...</p>
        </div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Club Not Found</h2>
            <p className="text-gray-600 mb-4">
                {error || 'The club you\'re looking for doesn&#39;t exist or has been removed.'}
              </p>
            <Link href="/">
              <Button className="uw">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            {isClubAdmin && (
              <Link href={`/clubs/${club.slug}/manage`}>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Club
                </Button>
              </Link>
            )}
            <Button
              variant={following ? "outline" : "default"}
              onClick={handleFollow}
            >
              {following ? 'Following' : 'Follow Club'}
            </Button>
          </div>
        </div>

        {/* Club Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Image */}
            {club.cover_image_url && (
              <div className="aspect-video bg-gradient-to-r from-husky-purple to-husky-gold">
                <img
                  src={club.cover_image_url}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Club Info */}
            <div className="p-6">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {club.profile_image_url ? (
                    <img
                      src={club.profile_image_url}
                      alt={club.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-husky-purple rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {club.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Club Details */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  
                  {club.description && (
                    <p className="text-gray-600 mb-4">{club.description}</p>
                  )}

                  {/* Club Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-husky-purple" />
                      <span>{club.members?.length || 0} members</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-husky-purple" />
                      <span>{events.length} events</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-4">
                    {club.website_url && (
                      <a
                        href={club.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-husky-purple hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                    
                    {club.instagram_url && (
                      <a
                        href={club.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-husky-purple hover:underline"
                      >
                        <Instagram className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    )}
                    
                    {club.discord_url && (
                      <a
                        href={club.discord_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-husky-purple hover:underline"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Discord
                      </a>
                    )}
                    
                    {club.contact_email && (
                      <a
                        href={`mailto:${club.contact_email}`}
                        className="flex items-center text-husky-purple hover:underline"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-husky-purple" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.filter(e => new Date(e.start_time) > new Date()).length > 0 ? (
                  <div className="space-y-4">
                    {events
                      .filter(e => new Date(e.start_time) > new Date())
                      .slice(0, 5)
                      .map((event) => (
                        <ClubEventCard key={event.id} event={event} />
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming events scheduled</p>
                )}
              </CardContent>
            </Card>

            {/* Past Events */}
            {events.filter(e => new Date(e.start_time) <= new Date()).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events
                      .filter(e => new Date(e.start_time) <= new Date())
                      .slice(0, 3)
                      .map((event) => (
                        <ClubEventCard key={event.id} event={event} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interests */}
            {club.interests && club.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {club.interests.map((interest) => (
                      <Badge key={interest.id} variant="outline">
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Club Members */}
            <Card>
              <CardHeader>
                <CardTitle>Club Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {club.members?.slice(0, 5).map((member) => (
                    <div key={member.user_id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-husky-purple rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.user?.display_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user?.display_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  
                  {club.members && club.members.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{club.members.length - 5} more members
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
