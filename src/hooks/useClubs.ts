import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Club } from '@/types/clubs'

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('clubs')
        .select(`
          *,
          interests:club_interests(interest:interests(*))
        `)
        .eq('status', 'approved')
        .order('name', { ascending: true })

      if (error) throw error

      // Transform the data to match our Club interface
      const transformedClubs = data?.map(club => ({
        ...club,
        interests: club.interests?.map((ci: any) => ci.interest).filter(Boolean) || [],
      })) || []

      setClubs(transformedClubs)
    } catch (err) {
      console.error('Error fetching clubs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs')
    } finally {
      setLoading(false)
    }
  }

  const createClub = async (clubData: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clubs')
        .insert([clubData])
        .select()
        .single()

      if (error) throw error

      // Refresh clubs list
      await fetchClubs()
      return { success: true, data }
    } catch (err) {
      console.error('Error creating club:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create club' }
    } finally {
      setLoading(false)
    }
  }

  const updateClub = async (id: string, updates: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clubs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Refresh clubs list
      await fetchClubs()
      return { success: true, data }
    } catch (err) {
      console.error('Error updating club:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update club' }
    } finally {
      setLoading(false)
    }
  }

  const deleteClub = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh clubs list
      await fetchClubs()
      return { success: true }
    } catch (err) {
      console.error('Error deleting club:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete club' }
    } finally {
      setLoading(false)
    }
  }

  const followClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('follows')
        .insert([{ user_id: user.id, club_id: clubId }])

      if (error) throw error

      return { success: true }
    } catch (err) {
      console.error('Error following club:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to follow club' }
    }
  }

  const unfollowClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', clubId)

      if (error) throw error

      return { success: true }
    } catch (err) {
      console.error('Error unfollowing club:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to unfollow club' }
    }
  }

  return {
    clubs,
    loading,
    error,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub,
    followClub,
    unfollowClub,
  }
}
