'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, MapPin, Users, Filter, X } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'
import { EventFilters } from '@/types/events'

interface SidebarProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ filters, onFiltersChange, isOpen, onToggle }: SidebarProps) {
  const { clubs, loading: clubsLoading } = useClubs()
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters)

  const categories = [
    { id: 'academic', name: 'Academic' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'social', name: 'Social' },
    { id: 'career', name: 'Career' },
    { id: 'sports', name: 'Sports' },
    { id: 'volunteer', name: 'Volunteer' },
  ]

  const interests = [
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'entrepreneurship', name: 'Entrepreneurship' },
    { id: 'networking', name: 'Networking' },
  ]

  const accessibilityFeatures = [
    { id: 'wheelchair', name: 'Wheelchair Accessible' },
    { id: 'asl', name: 'ASL Interpreter' },
    { id: 'captioning', name: 'Captioning' },
    { id: 'scent-free', name: 'Scent-Free' },
  ]

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = localFilters.categories || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    handleFilterChange('categories', newCategories)
  }

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = localFilters.interests || []
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId]
    handleFilterChange('interests', newInterests)
  }

  const handleClubToggle = (clubId: string) => {
    const currentClubs = localFilters.clubs || []
    const newClubs = currentClubs.includes(clubId)
      ? currentClubs.filter(id => id !== clubId)
      : [...currentClubs, clubId]
    handleFilterChange('clubs', newClubs)
  }

  const handleAccessibilityToggle = (featureId: string) => {
    const currentFeatures = localFilters.accessibility_features || []
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(id => id !== featureId)
      : [...currentFeatures, featureId]
    handleFilterChange('accessibility_features', newFeatures)
  }

  const clearFilters = () => {
    const clearedFilters: EventFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 lg:hidden"
      >
        <Filter className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 overflow-y-auto lg:static lg:z-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
              <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={localFilters.categories?.includes(category.id) || false}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label htmlFor={category.id} className="text-sm text-gray-700">
                    {category.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clubs */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Clubs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clubsLoading ? (
                <div className="text-sm text-gray-500">Loading clubs...</div>
              ) : (
                clubs.slice(0, 10).map((club) => (
                  <div key={club.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={club.id}
                      checked={localFilters.clubs?.includes(club.id) || false}
                      onCheckedChange={() => handleClubToggle(club.id)}
                    />
                    <label htmlFor={club.id} className="text-sm text-gray-700">
                      {club.name}
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-campus"
                  checked={localFilters.location === 'on_campus'}
                  onCheckedChange={(checked) => 
                    handleFilterChange('location', checked ? 'on_campus' : undefined)
                  }
                />
                <label htmlFor="on-campus" className="text-sm text-gray-700">
                  On Campus
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="virtual"
                  checked={localFilters.location === 'virtual'}
                  onCheckedChange={(checked) => 
                    handleFilterChange('location', checked ? 'virtual' : undefined)
                  }
                />
                <label htmlFor="virtual" className="text-sm text-gray-700">
                  Virtual
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {accessibilityFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={localFilters.accessibility_features?.includes(feature.id) || false}
                    onCheckedChange={() => handleAccessibilityToggle(feature.id)}
                  />
                  <label htmlFor={feature.id} className="text-sm text-gray-700">
                    {feature.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
