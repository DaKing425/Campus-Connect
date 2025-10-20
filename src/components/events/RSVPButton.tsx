'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
const sb = supabase as any
import { useAuth } from '@/hooks/useAuth'
import { Event, RSVP } from '@/types/events'
import { Calendar, Users, Clock, MapPin, ExternalLink } from 'lucide-react'
import { formatEventDateTime, formatEventTime, getEventDuration } from '@/lib/utils'

interface RSVPButtonProps {
  event: Event
  userRSVP?: RSVP
  onRSVPChange?: (rsvp: RSVP | null) => void
}

export function RSVPButton({ event, userRSVP, onRSVPChange }: RSVPButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isUpcoming = new Date(event.start_time) > new Date()
  const isPast = new Date(event.end_time) < new Date()
  const isFull = event.capacity && event.rsvp_count && event.rsvp_count >= event.capacity
  const canRSVP = isUpcoming && !isPast && (!isFull || event.is_waitlist_enabled)

  const handleRSVP = async (status: 'going' | 'interested') => {
    if (!user) {
      setError('Please sign in to RSVP')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (userRSVP) {
        // Update existing RSVP
  const { data, error } = await sb
          .from('rsvps')
          .update({
            status,
            rsvp_time: new Date().toISOString(),
            cancelled_at: null,
            waitlist_position: null,
            promotion_expires_at: null,
          })
          .eq('id', userRSVP.id)
          .select()
          .single()

        if (error) throw error
        onRSVPChange?.(data)
      } else {
        // Create new RSVP
        const { data, error } = await sb
          .from('rsvps')
          .insert({
            user_id: user.id,
            event_id: event.id,
            status,
            rsvp_time: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        onRSVPChange?.(data)
      }
    } catch (err) {
      console.error('RSVP error:', err)
      setError(err instanceof Error ? err.message : 'Failed to RSVP')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRSVP = async () => {
    if (!userRSVP) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await sb
        .from('rsvps')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', userRSVP.id)

      if (error) throw error
      onRSVPChange?.(null)
    } catch (err) {
      console.error('Cancel RSVP error:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel RSVP')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (userRSVP?.status === 'going') return 'Cancel RSVP'
    if (userRSVP?.status === 'interested') return 'Cancel Interest'
    if (userRSVP?.status === 'waitlisted') return 'On Waitlist'
    if (isFull && event.is_waitlist_enabled) return 'Join Waitlist'
    return 'RSVP'
  }

  const getButtonVariant = () => {
    if (userRSVP?.status === 'going' || userRSVP?.status === 'interested') return 'destructive'
    if (userRSVP?.status === 'waitlisted') return 'secondary'
    return 'default'
  }

  const handleClick = () => {
    if (userRSVP?.status === 'going' || userRSVP?.status === 'interested') {
      handleCancelRSVP()
    } else {
      handleRSVP('going')
    }
  }

  if (!canRSVP) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">
            {isPast ? 'This event has ended' : 'RSVPs are not available'}
          </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-2">
        <Button
          onClick={handleClick}
          variant={getButtonVariant()}
          className="flex-1"
          disabled={loading}
        >
          {loading ? 'Processing...' : getButtonText()}
        </Button>

        {!userRSVP && (
          <Button
            onClick={() => handleRSVP('interested')}
            variant="outline"
            disabled={loading}
          >
            Interested
          </Button>
        )}
      </div>

      {userRSVP?.status === 'waitlisted' && userRSVP.waitlist_position && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800 text-sm">
              You&#39;re #{userRSVP.waitlist_position} on the waitlist
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface EventDetailsProps {
  event: Event
  userRSVP?: RSVP
  onRSVPChange?: (rsvp: RSVP | null) => void
}

export function EventDetails({ event, userRSVP, onRSVPChange }: EventDetailsProps) {
  const isUpcoming = new Date(event.start_time) > new Date()
  const isPast = new Date(event.end_time) < new Date()

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
        {event.club && (
          <p className="text-lg text-husky-purple">Hosted by {event.club.name}</p>
        )}
      </div>

      {/* Event Image */}
      {event.image_url && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-husky-purple" />
              <div>
                <p className="font-medium">{formatEventDateTime(event.start_time)}</p>
                <p className="text-sm">Duration: {getEventDuration(event.start_time, event.end_time)}</p>
              </div>
            </div>

            {event.venue && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-husky-purple" />
                <div>
                  <p className="font-medium">{event.venue.name}</p>
                  {event.venue.room_number && (
                    <p className="text-sm">{event.venue.room_number}</p>
                  )}
                </div>
              </div>
            )}

            {event.virtual_url && (
              <div className="flex items-center text-gray-600">
                <ExternalLink className="h-5 w-5 mr-3 text-husky-purple" />
                <a
                  href={event.virtual_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-husky-purple hover:underline"
                >
                  Join Virtual Event
                </a>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3 text-husky-purple" />
                <div>
                  <p className="font-medium">
                    {event.rsvp_count || 0} / {event.capacity} attendees
                  </p>
                  {event.rsvp_count && event.rsvp_count >= event.capacity && event.is_waitlist_enabled && (
                    <p className="text-sm text-orange-600">Waitlist available</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RSVP Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">RSVP</h3>
            <RSVPButton
              event={event}
              userRSVP={userRSVP}
              onRSVPChange={onRSVPChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Event Description */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">About This Event</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Categories and Interests */}
      {(event.categories?.length || event.interests?.length) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.categories?.map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-husky-purple text-white text-sm rounded-full"
                >
                  {category.name}
                </span>
              ))}
              {event.interests?.map((interest) => (
                <span
                  key={interest.id}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
