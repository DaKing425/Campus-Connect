'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { eventFormSchema, validateFormData } from '@/lib/utils/validation'
import { formatEventDateTime } from '@/lib/utils'
import { Calendar, MapPin, Users, Clock, Upload, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { createEvent } = useEvents()
  const { clubs } = useClubs()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    timezone: 'America/Los_Angeles',
    venue_id: '',
    virtual_url: '',
    capacity: '',
    is_waitlist_enabled: false,
    rsvp_buffer: 0,
    rsvp_close_time: '',
    visibility: 'public' as const,
    image_url: '',
    category_ids: [] as string[],
    interest_ids: [] as string[],
  })

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

  const venues = [
    { id: 'hub-211', name: 'HUB Room 211' },
    { id: 'kane-130', name: 'Kane Hall Room 130' },
    { id: 'mary-gates-241', name: 'Mary Gates Hall Room 241' },
    { id: 'virtual', name: 'Virtual Event' },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }))
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = formData.category_ids
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    handleInputChange('category_ids', newCategories)
  }

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = formData.interest_ids
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId]
    handleInputChange('interest_ids', newInterests)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validate form data
    const validation = validateFormData(eventFormSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      setLoading(false)
      return
    }

    try {
      // Prepare event data
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        club_id: profile?.role === 'club_admin' ? clubs.find(c => c.members?.some(m => m.user_id === user?.id && m.role === 'owner'))?.id : null,
        created_by: user?.id!,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'pending_approval',
      }

      const result = await createEvent(eventData)
      if (result.success) {
        router.push('/events')
      } else {
        setErrors({ general: [result.error || 'Failed to create event'] })
      }
    } catch (error) {
      setErrors({ general: ['An unexpected error occurred'] })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to create events.</p>
            <Link href="/auth/login">
              <Button className="uw">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 ml-2">Create Event</h1>
          </div>
          <p className="text-gray-600">Share your event with the UW community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-husky-purple" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title[0]}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>}
              </div>

              <div>
                <Label htmlFor="image_url">Event Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-husky-purple" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className={errors.start_time ? 'border-red-500' : ''}
                  />
                  {errors.start_time && <p className="text-red-600 text-sm mt-1">{errors.start_time[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={errors.end_time ? 'border-red-500' : ''}
                  />
                  {errors.end_time && <p className="text-red-600 text-sm mt-1">{errors.end_time[0]}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-husky-purple" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="venue_id">Venue</Label>
                <Select value={formData.venue_id} onValueChange={(value) => handleInputChange('venue_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="virtual_url">Virtual Event URL</Label>
                <Input
                  id="virtual_url"
                  type="url"
                  value={formData.virtual_url}
                  onChange={(e) => handleInputChange('virtual_url', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* RSVP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-husky-purple" />
                RSVP Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_waitlist_enabled"
                  checked={formData.is_waitlist_enabled}
                  onCheckedChange={(checked) => handleInputChange('is_waitlist_enabled', checked)}
                />
                <Label htmlFor="is_waitlist_enabled">Enable waitlist when full</Label>
              </div>

              <div>
                <Label htmlFor="rsvp_buffer">RSVP Buffer</Label>
                <Input
                  id="rsvp_buffer"
                  type="number"
                  value={formData.rsvp_buffer}
                  onChange={(e) => handleInputChange('rsvp_buffer', parseInt(e.target.value))}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-500 mt-1">Allow slight overbooking (0-100 people)</p>
              </div>

              <div>
                <Label htmlFor="rsvp_close_time">RSVP Close Time</Label>
                <Input
                  id="rsvp_close_time"
                  type="datetime-local"
                  value={formData.rsvp_close_time}
                  onChange={(e) => handleInputChange('rsvp_close_time', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories & Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Categories *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.category_ids.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.category_ids && <p className="text-red-600 text-sm mt-1">{errors.category_ids[0]}</p>}
              </div>

              <div>
                <Label className="text-base font-medium">Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {interests.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={formData.interest_ids.includes(interest.id)}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                      />
                      <Label htmlFor={interest.id} className="text-sm">
                        {interest.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="visibility">Who can see this event?</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="campus_only">Campus Only - UW students only</SelectItem>
                    <SelectItem value="private_link">Private Link - Only with direct link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.general && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">{errors.general[0]}</p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="uw" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
