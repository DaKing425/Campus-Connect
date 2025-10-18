// Date and time utilities
import { format, parseISO, isValid } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

export const DEFAULT_TIMEZONE = 'America/Los_Angeles'

export function formatEventDate(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid date'
    
    return format(dateObj, 'EEEE, MMMM d, yyyy')
  } catch (error) {
    return 'Invalid date'
  }
}

export function formatEventTime(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid time'
    
    return format(dateObj, 'h:mm a')
  } catch (error) {
    return 'Invalid time'
  }
}

export function formatEventDateTime(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid date/time'
    
    return format(dateObj, 'EEEE, MMMM d, yyyy \'at\' h:mm a')
  } catch (error) {
    return 'Invalid date/time'
  }
}

export function isEventUpcoming(startTime: string | Date): boolean {
  const now = new Date()
  const eventStart = typeof startTime === 'string' ? parseISO(startTime) : startTime
  return eventStart > now
}

export function isEventPast(endTime: string | Date): boolean {
  const now = new Date()
  const eventEnd = typeof endTime === 'string' ? parseISO(endTime) : endTime
  return eventEnd < now
}

export function getEventDuration(startTime: string | Date, endTime: string | Date): string {
  try {
    const start = typeof startTime === 'string' ? parseISO(startTime) : startTime
    const end = typeof endTime === 'string' ? parseISO(endTime) : endTime
    
    if (!isValid(start) || !isValid(end)) return 'Invalid duration'
    
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      const hours = Math.floor((diffInMinutes % 1440) / 60)
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
  } catch (error) {
    return 'Invalid duration'
  }
}

export function convertToTimezone(date: string | Date, timezone: string): Date {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return utcToZonedTime(dateObj, timezone)
  } catch (error) {
    return new Date()
  }
}

export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60)
    
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    const sign = offset >= 0 ? '+' : '-'
    
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  } catch (error) {
    return 'UTC+00:00'
  }
}
