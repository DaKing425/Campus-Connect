'use client'

import { useState, useEffect } from 'react'
import { Club } from '@/types/clubs'

// Mock clubs data
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    slug: 'cs-club',
    description: 'The official Computer Science club at UW. We organize hackathons, coding workshops, and tech talks.',
    website_url: 'https://csclub.uw.edu',
    instagram_handle: '@uwcsclub',
    discord_url: 'https://discord.gg/uwcs',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 150,
    event_count: 12,
    upcoming_events: [
      {
        id: '1',
        title: 'Hackathon 2024',
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        slug: 'hackathon-2024'
      }
    ]
  },
  {
    id: '2',
    name: 'Business Club',
    slug: 'business-club',
    description: 'Professional development and networking opportunities for business-minded students.',
    website_url: 'https://businessclub.uw.edu',
    instagram_handle: '@uwbusiness',
    discord_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 200,
    event_count: 8,
    upcoming_events: [
      {
        id: '2',
        title: 'Career Fair 2024',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        slug: 'career-fair-2024'
      }
    ]
  },
  {
    id: '3',
    name: 'Cultural Association',
    slug: 'cultural-association',
    description: 'Promoting cultural diversity and understanding on campus through events and activities.',
    website_url: 'https://cultural.uw.edu',
    instagram_handle: '@uwcultural',
    discord_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 300,
    event_count: 15,
    upcoming_events: [
      {
        id: '3',
        title: 'Cultural Night',
        start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        slug: 'cultural-night'
      }
    ]
  },
  {
    id: '4',
    name: 'Environmental Club',
    slug: 'environmental-club',
    description: 'Working towards a more sustainable campus and world through education and action.',
    website_url: 'https://envclub.uw.edu',
    instagram_handle: '@uwenvclub',
    discord_url: 'https://discord.gg/uwenv',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 120,
    event_count: 6,
    upcoming_events: []
  },
  {
    id: '5',
    name: 'Photography Club',
    slug: 'photography-club',
    description: 'Capture campus life and explore the art of photography with fellow students.',
    website_url: 'https://photoclub.uw.edu',
    instagram_handle: '@uwphotoclub',
    discord_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 80,
    event_count: 4,
    upcoming_events: []
  }
]

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setClubs(mockClubs)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchClubs = async (filters?: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setClubs(mockClubs)
    setLoading(false)
  }

  const createClub = async (clubData: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newClub = {
      ...clubData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 0,
      event_count: 0,
      upcoming_events: []
    }
    setClubs(prev => [newClub, ...prev])
    setLoading(false)
    return { success: true, data: newClub }
  }

  const updateClub = async (clubId: string, updates: any) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setClubs(prev => prev.map(club => 
      club.id === clubId ? { ...club, ...updates } : club
    ))
    setLoading(false)
    return { success: true }
  }

  const deleteClub = async (clubId: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setClubs(prev => prev.filter(club => club.id !== clubId))
    setLoading(false)
    return { success: true }
  }

  return {
    clubs,
    loading,
    error,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub
  }
}