'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/types/users'

// Mock user data
const mockUser = {
  id: 'mock-user-id',
  email: 'student@uw.edu',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProfile: Profile = {
  id: 'mock-user-id',
  email: 'student@uw.edu',
  display_name: 'UW Student',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  graduation_year: 2025,
  major: 'Computer Science',
  bio: 'Passionate about technology and campus life!',
  avatar_url: null,
  is_public: true,
  allow_personalization: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export function useAuth() {
  const [user, setUser] = useState(mockUser)
  const [profile, setProfile] = useState<Profile | null>(mockProfile)
  const [session, setSession] = useState(mockUser)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const signInWithEmail = async (email: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    return { success: true }
  }

  const signOut = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser(null)
    setProfile(null)
    setSession(null)
    setIsAuthenticated(false)
    setLoading(false)
    return { success: true }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setProfile(prev => prev ? { ...prev, ...updates } : null)
    setLoading(false)
    return { success: true }
  }

  return {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signOut,
    updateProfile,
    isAuthenticated,
    isUWUser: true,
  }
}