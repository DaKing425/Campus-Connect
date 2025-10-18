'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Event } from '@/types/events'
import { formatEventDateTime, formatEventTime, getRelativeTime } from '@/lib/utils'
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react'

interface EventCardProps {
  event: Event
  showRSVP?: boolean
  onRSVP?: (eventId: string) => void
  onCancelRSVP?: (eventId: string) => void
}

export function EventCard({ event, showRSVP = true, onRSVP, onCancelRSVP }: EventCardProps) {
  const isUpcoming = new Date(event.start_time) > new Date()
  const isFull = event.capacity && event.rsvp_count && event.rsvp_count >= event.capacity
  const userRSVP = event.user_rsvp

  const handleRSVP = () => {
    if (userRSVP?.status === 'going') {
      onCancelRSVP?.(event.id)
    } else {
      onRSVP?.(event.id)
    }
  }

  const getRSVPButtonText = () => {
    if (userRSVP?.status === 'going') return 'Cancel RSVP'
    if (userRSVP?.status === 'waitlisted') return 'On Waitlist'
    if (isFull && event.is_waitlist_enabled) return 'Join Waitlist'
    return 'RSVP'
  }

  const getRSVPButtonVariant = () => {
    if (userRSVP?.status === 'going') return 'destructive'
    if (userRSVP?.status === 'waitlisted') return 'secondary'
    return 'default'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/events/${event.slug}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-husky-purple transition-colors cursor-pointer">
                {event.title}
              </h3>
            </Link>
            
            {event.club && (
              <Link href={`/clubs/${event.club.slug}`}>
                <p className="text-sm text-husky-purple hover:underline cursor-pointer mt-1">
                  {event.club.name}
                </p>
              </Link>
            )}
          </div>
          
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-16 h-16 object-cover rounded-lg ml-4"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Summary */}
        {event.summary && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.summary}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-husky-purple" />
            <span>{formatEventDateTime(event.start_time, event.timezone)}</span>
          </div>

          {event.venue && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-husky-purple" />
              <span>{event.venue.name}</span>
              {event.venue.room_number && (
                <span className="ml-1">- {event.venue.room_number}</span>
              )}
            </div>
          )}

          {event.virtual_url && (
            <div className="flex items-center text-sm text-gray-600">
              <ExternalLink className="h-4 w-4 mr-2 text-husky-purple" />
              <a 
                href={event.virtual_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-husky-purple hover:underline"
              >
                Virtual Event
              </a>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-husky-purple" />
              <span>
                {event.rsvp_count || 0} / {event.capacity} attendees
                {isFull && event.is_waitlist_enabled && (
                  <span className="text-orange-600 ml-1">(Waitlist available)</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Categories and Interests */}
        <div className="flex flex-wrap gap-1">
          {event.categories?.slice(0, 3).map((category) => (
            <Badge key={category.id} variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          ))}
          {event.interests?.slice(0, 2).map((interest) => (
            <Badge key={interest.id} variant="outline" className="text-xs">
              {interest.name}
            </Badge>
          ))}
        </div>

        {/* RSVP Button */}
        {showRSVP && isUpcoming && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant={getRSVPButtonVariant()}
              size="sm"
              onClick={handleRSVP}
              className="flex-1"
            >
              {getRSVPButtonText()}
            </Button>
            
            <Link href={`/events/${event.slug}`}>
              <Button variant="outline" size="sm" className="ml-2">
                Details
              </Button>
            </Link>
          </div>
        )}

        {/* Waitlist Position */}
        {userRSVP?.status === 'waitlisted' && userRSVP.waitlist_position && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            You're #{userRSVP.waitlist_position} on the waitlist
          </div>
        )}
      </CardContent>
    </Card>
  )
}
