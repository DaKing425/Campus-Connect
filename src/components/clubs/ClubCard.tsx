'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Club } from '@/types/clubs'
import { Event } from '@/types/events'
import { Users, Calendar, ExternalLink, Instagram, MessageCircle } from 'lucide-react'

interface ClubCardProps {
  club: Club
  showFollow?: boolean
  onFollow?: (clubId: string) => void
  onUnfollow?: (clubId: string) => void
}

export function ClubCard({ club, showFollow = true, onFollow, onUnfollow }: ClubCardProps) {
  const handleFollow = () => {
    if (club.is_following) {
      onUnfollow?.(club.id)
    } else {
      onFollow?.(club.id)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/clubs/${club.slug}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-husky-purple transition-colors cursor-pointer">
                {club.name}
              </h3>
            </Link>
            
            {club.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {club.description}
              </p>
            )}
          </div>
          
          {club.profile_image_url && (
            <img
              src={club.profile_image_url}
              alt={club.name || 'Club image'}
              className="w-16 h-16 object-cover rounded-lg ml-4"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Club Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {club.follower_count && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-husky-purple" />
              <span>{club.follower_count} followers</span>
            </div>
          )}
          
          {club.events && club.events.length > 0 && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-husky-purple" />
              <span>{club.events.length} events</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-2">
          {club.website_url && (
            <a
              href={club.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-husky-purple hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          {club.instagram_url && (
            <a
              href={club.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-husky-purple hover:underline"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          
          {club.discord_url && (
            <a
              href={club.discord_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-husky-purple hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Interests */}
        {club.interests && club.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {club.interests.slice(0, 3).map((interest) => (
              <Badge key={interest.id} variant="outline" className="text-xs">
                {interest.name}
              </Badge>
            ))}
            {club.interests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{club.interests.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {showFollow && (
            <Button
              variant={club.is_following ? "outline" : "default"}
              size="sm"
              onClick={handleFollow}
              className="flex-1"
            >
              {club.is_following ? 'Following' : 'Follow'}
            </Button>
          )}
          
          <Link href={`/clubs/${club.slug}`}>
            <Button variant="outline" size="sm" className="ml-2">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

interface ClubEventCardProps {
  event: Event
}

export function ClubEventCard({ event }: ClubEventCardProps) {
  const isUpcoming = new Date(event.start_time) > new Date()
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/events/${event.slug}`}>
              <h4 className="font-medium text-gray-900 hover:text-husky-purple transition-colors cursor-pointer">
                {event.title}
              </h4>
            </Link>
            
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1 text-husky-purple" />
              <span>
                {new Date(event.start_time).toLocaleDateString()} at{' '}
                {new Date(event.start_time).toLocaleTimeString([], { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {event.venue && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span>{event.venue.name}</span>
                {event.venue.room_number && (
                  <span className="ml-1">- {event.venue.room_number}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-right">
            {isUpcoming ? (
              <Badge variant="default" className="text-xs">
                Upcoming
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Past
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
