import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Event, EventFilters } from '@/types/events'

export function useEvents(filters?: EventFilters) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('events')
        .select(`
          *,
          club:clubs(*),
          venue:venues(*),
          categories:event_categories(category:categories(*)),
          interests:event_interests(interest:interests(*))
        `)
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      // Apply filters
      if (filters?.categories?.length) {
        query = query.in('id', 
          supabase
            .from('event_categories')
            .select('event_id')
            .in('category_id', filters.categories)
        )
      }

      if (filters?.interests?.length) {
        query = query.in('id',
          supabase
            .from('event_interests')
            .select('event_id')
            .in('interest_id', filters.interests)
        )
      }

      if (filters?.clubs?.length) {
        query = query.in('club_id', filters.clubs)
      }

      if (filters?.date_range) {
        query = query
          .gte('start_time', filters.date_range.start)
          .lte('start_time', filters.date_range.end)
      }

      if (filters?.location) {
        if (filters.location === 'virtual') {
          query = query.not('virtual_url', 'is', null)
        } else if (filters.location === 'on_campus') {
          query = query.not('venue_id', 'is', null).is('virtual_url', null)
        }
      }

      if (filters?.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match our Event interface
      const transformedEvents = data?.map(event => ({
        ...event,
        categories: event.categories?.map((ec: any) => ec.category).filter(Boolean) || [],
        interests: event.interests?.map((ei: any) => ei.interest).filter(Boolean) || [],
      })) || []

      setEvents(transformedEvents)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error

      // Refresh events list
      await fetchEvents()
      return { success: true, data }
    } catch (err) {
      console.error('Error creating event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create event' }
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (id: string, updates: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Refresh events list
      await fetchEvents()
      return { success: true, data }
    } catch (err) {
      console.error('Error updating event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update event' }
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh events list
      await fetchEvents()
      return { success: true }
    } catch (err) {
      console.error('Error deleting event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete event' }
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
