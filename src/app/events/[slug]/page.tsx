'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EventDetails } from '@/components/events/RSVPButton'
import { supabase } from '@/lib/supabase/client'
import { Event, RSVP } from '@/types/events'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'

export default function EventDetailPage() {
  const params = useParams()
  const eventSlug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [eventSlug])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch event with related data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          club:clubs(*),
          venue:venues(*),
          categories:event_categories(category:categories(*)),
          interests:event_interests(interest:interests(*))
        `)
        .eq('slug', eventSlug)
        .eq('status', 'approved')
        .single()

      if (eventError) throw eventError

      // Transform the data
      const transformedEvent = {
        ...eventData,
        categories: eventData.categories?.map((ec: any) => ec.category).filter(Boolean) || [],
        interests: eventData.interests?.map((ei: any) => ei.interest).filter(Boolean) || [],
      }

      setEvent(transformedEvent)

      // Fetch user's RSVP if logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: rsvpData, error: rsvpError } = await supabase
          .from('rsvps')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_id', eventData.id)
          .single()

        if (!rsvpError && rsvpData) {
          setUserRSVP(rsvpData)
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const handleRSVPChange = (rsvp: RSVP | null) => {
    setUserRSVP(rsvp)
    // Refresh event data to update RSVP count
    fetchEvent()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.summary || event?.description,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const generateCalendarLink = () => {
    if (!event) return ''
    
    const startDate = new Date(event.start_time)
    const endDate = new Date(event.end_time)
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.venue?.name || event.virtual_url || '',
    })
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-husky-purple mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The event you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href="/">
              <Button className="uw">Back to Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" asChild>
              <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </a>
            </Button>
          </div>
        </div>

        {/* Event Details */}
        <EventDetails
          event={event}
          userRSVP={userRSVP}
          onRSVPChange={handleRSVPChange}
        />

        {/* Related Events */}
        {event.club && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">More from {event.club.name}</h3>
              <p className="text-gray-600 mb-4">
                Discover other events hosted by this club.
              </p>
              <Link href={`/clubs/${event.club.slug}`}>
                <Button variant="outline">View Club Page</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
