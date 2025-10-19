'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types/events'

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Hackathon 2024',
    description: 'Join us for the biggest hackathon of the year! Build amazing projects, meet new people, and win prizes.',
    summary: 'Annual hackathon with prizes and networking',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000).toISOString(), // 2 days later
    timezone: 'America/Los_Angeles',
    venue_id: '1',
    virtual_url: null,
    capacity: 200,
    rsvp_buffer: 20,
    is_waitlist_enabled: true,
    rsvp_close_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    visibility: 'public',
    status: 'approved',
    slug: 'hackathon-2024',
    created_by: 'club-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    approved_by: 'admin-1',
    club: {
      id: '1',
      name: 'Computer Science Club',
      slug: 'cs-club',
      description: 'The official CS club at UW',
      website_url: 'https://csclub.uw.edu',
      instagram_handle: '@uwcsclub',
      discord_url: 'https://discord.gg/uwcs',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    venue: {
      id: '1',
      name: 'Kane Hall',
      room_number: '130',
      address: '4069 Spokane Ln, Seattle, WA 98105',
      capacity: 200,
      is_accessible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    categories: [
      { id: '1', name: 'Technology', slug: 'technology' },
      { id: '2', name: 'Academic', slug: 'academic' }
    ],
    interests: [
      { id: '1', name: 'Programming', slug: 'programming' },
      { id: '2', name: 'Networking', slug: 'networking' }
    ]
  },
  {
    id: '2',
    title: 'Career Fair 2024',
    description: 'Connect with top employers and explore career opportunities in tech, finance, and more.',
    summary: 'Annual career fair with top employers',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 6 hours later
    timezone: 'America/Los_Angeles',
    venue_id: '2',
    virtual_url: null,
    capacity: 500,
    rsvp_buffer: 50,
    is_waitlist_enabled: true,
    rsvp_close_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    visibility: 'public',
    status: 'approved',
    slug: 'career-fair-2024',
    created_by: 'club-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    approved_by: 'admin-1',
    club: {
      id: '2',
      name: 'Business Club',
      slug: 'business-club',
      description: 'Professional development and networking',
      website_url: 'https://businessclub.uw.edu',
      instagram_handle: '@uwbusiness',
      discord_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    venue: {
      id: '2',
      name: 'HUB Ballroom',
      room_number: 'Ballroom A',
      address: '4001 E Stevens Way NE, Seattle, WA 98195',
      capacity: 500,
      is_accessible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    categories: [
      { id: '3', name: 'Career', slug: 'career' }
    ],
    interests: [
      { id: '3', name: 'Professional Development', slug: 'professional-development' }
    ]
  },
  {
    id: '3',
    title: 'Cultural Night',
    description: 'Celebrate diversity and culture with performances, food, and activities from around the world.',
    summary: 'Cultural celebration with performances and food',
    start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    timezone: 'America/Los_Angeles',
    venue_id: '3',
    virtual_url: null,
    capacity: 300,
    rsvp_buffer: 30,
    is_waitlist_enabled: true,
    rsvp_close_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    visibility: 'public',
    status: 'approved',
    slug: 'cultural-night',
    created_by: 'club-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    approved_by: 'admin-1',
    club: {
      id: '3',
      name: 'Cultural Association',
      slug: 'cultural-association',
      description: 'Promoting cultural diversity on campus',
      website_url: 'https://cultural.uw.edu',
      instagram_handle: '@uwcultural',
      discord_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    venue: {
      id: '3',
      name: 'Kane Hall',
      room_number: '225',
      address: '4069 Spokane Ln, Seattle, WA 98105',
      capacity: 300,
      is_accessible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    categories: [
      { id: '4', name: 'Cultural', slug: 'cultural' }
    ],
    interests: [
      { id: '4', name: 'Cultural Events', slug: 'cultural-events' }
    ]
  }
]

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchEvents = async (filters?: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setEvents(mockEvents)
    setLoading(false)
  }

  const createEvent = async (eventData: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending_approval'
    }
    setEvents(prev => [newEvent, ...prev])
    setLoading(false)
    return { success: true, data: newEvent }
  }

  const updateEvent = async (eventId: string, updates: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ))
    setLoading(false)
    return { success: true }
  }

  const deleteEvent = async (eventId: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setEvents(prev => prev.filter(event => event.id !== eventId))
    setLoading(false)
    return { success: true }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}