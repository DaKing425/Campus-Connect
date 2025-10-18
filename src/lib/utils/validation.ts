// Form validation utilities
import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address')

export const uwEmailSchema = z.string().email('Please enter a valid email address').refine(
  (email) => email.endsWith('@uw.edu'),
  'Please use your UW email address (@uw.edu)'
)

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const displayNameSchema = z.string()
  .min(2, 'Display name must be at least 2 characters')
  .max(50, 'Display name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores')

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

// Event validation schemas
export const eventTitleSchema = z.string()
  .min(3, 'Event title must be at least 3 characters')
  .max(100, 'Event title must be less than 100 characters')

export const eventDescriptionSchema = z.string()
  .min(10, 'Event description must be at least 10 characters')
  .max(2000, 'Event description must be less than 2000 characters')

export const eventCapacitySchema = z.number()
  .int('Capacity must be a whole number')
  .min(1, 'Capacity must be at least 1')
  .max(10000, 'Capacity cannot exceed 10,000')

export const eventFormSchema = z.object({
  title: eventTitleSchema,
  description: eventDescriptionSchema,
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  venue_id: z.string().optional(),
  virtual_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  capacity: eventCapacitySchema.optional(),
  is_waitlist_enabled: z.boolean(),
  rsvp_buffer: z.number().int().min(0).max(100),
  rsvp_close_time: z.string().optional(),
  visibility: z.enum(['public', 'campus_only', 'private_link']),
  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  category_ids: z.array(z.string()).min(1, 'Please select at least one category'),
  interest_ids: z.array(z.string()).optional(),
}).refine(
  (data) => {
    const startTime = new Date(data.start_time)
    const endTime = new Date(data.end_time)
    return endTime > startTime
  },
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
)

// Club validation schemas
export const clubNameSchema = z.string()
  .min(3, 'Club name must be at least 3 characters')
  .max(100, 'Club name must be less than 100 characters')

export const clubDescriptionSchema = z.string()
  .min(10, 'Club description must be at least 10 characters')
  .max(1000, 'Club description must be less than 1000 characters')

export const clubFormSchema = z.object({
  name: clubNameSchema,
  description: clubDescriptionSchema,
  contact_email: emailSchema,
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  discord_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  profile_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  cover_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'campus_only']),
  interest_ids: z.array(z.string()).optional(),
})

// Profile validation schemas
export const profileFormSchema = z.object({
  display_name: displayNameSchema,
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  consent_personalization: z.boolean(),
  consent_share_major: z.boolean(),
  major: z.string().max(100).optional(),
  class_year: z.number().int().min(1900).max(2100).optional(),
  interest_ids: z.array(z.string()).optional(),
})

// Utility functions
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['An unexpected error occurred'] } }
  }
}

export function getFieldError(errors: Record<string, string[]> | undefined, field: string): string | undefined {
  return errors?.[field]?.[0]
}

export function hasFieldError(errors: Record<string, string[]> | undefined, field: string): boolean {
  return Boolean(errors?.[field]?.length)
}
