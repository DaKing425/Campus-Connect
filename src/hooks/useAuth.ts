"use client"

import { useState, useEffect } from 'react'
import { User, Profile } from '@/types/users'

// Mock user data (partial)
const mockUser: User = {
  id: 'mock-user-id',
  email: 'student@uw.edu',
  created_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString()
}

const mockProfile: Profile = {
  id: 'mock-user-id',
  display_name: 'UW Student',
  avatar_url: null,
  role: 'student',
  consent_personalization: true,
  consent_share_major: false,
  major: 'Computer Science',
  class_year: 2025,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user: mockUser,
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(mockUser)
  const [profile, setProfile] = useState<Profile | null>(mockProfile)
  const [session, setSession] = useState<User | null>(mockUser)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const signInWithEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    return { success: true }
  }

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
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

  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
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