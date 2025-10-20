'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { EventCard } from '@/components/events/EventCard'
import { useEvents } from '@/hooks/useEvents'
import { EventFilters } from '@/types/events'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, TrendingUp, Star } from 'lucide-react'

export default function HomePage() {
  const [filters, setFilters] = useState<EventFilters>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { events, loading, error } = useEvents(filters)

  const handleRSVP = async (eventId: string) => {
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, status: 'going' }),
      })

      if (!res.ok) {
        const json = await res.json()
        alert(json?.error || 'Failed to RSVP')
        return
      }

      // Refresh events
      // We optimistically refetch events via the hook by changing filters (quick hack)
      setFilters({ ...filters })
    } catch (err) {
      alert('Failed to RSVP')
    }
  }

  const handleCancelRSVP = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/rsvp?event_id=${encodeURIComponent(eventId)}`, { method: 'DELETE' })

      if (!res.ok) {
        const json = await res.json()
        alert(json?.error || 'Failed to cancel RSVP')
        return
      }

      setFilters({ ...filters })
    } catch (err) {
      alert('Failed to cancel RSVP')
    }
  }

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <Sidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isOpen={true}
          onToggle={() => {}}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Sidebar */}
        <Sidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Discover Events
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Find and join student events, clubs, and activities across campus
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="hidden sm:flex">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
                <Button className="uw">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Featured Sections */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Upcoming Events */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-husky-purple mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    {events.filter(e => new Date(e.start_time) > new Date()).length} events this week
                  </p>
                </div>

                {/* Trending */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 text-husky-gold mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Most popular events across campus
                  </p>
                </div>

                {/* Recommended */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-husky-lavender mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Recommended</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Personalized for you
                  </p>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-husky-purple mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading events: {error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRSVP={handleRSVP}
                    onCancelRSVP={handleCancelRSVP}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
