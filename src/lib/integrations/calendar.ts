// Calendar integration utilities for CampusConnect
// This module uses browser APIs (window, document). Ensure it is only imported from client components.
"use client"

import { Event } from '@/types/events'

export interface CalendarEvent {
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  url?: string
}

export function generateGoogleCalendarLink(event: Event): string {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.venue?.name || event.virtual_url || '',
    trp: 'false'
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generateICSEvent(event: Event): string {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const escapeText = (text: string) => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n')
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//UW Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campusconnect.uw.edu`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
    event.venue?.name ? `LOCATION:${escapeText(event.venue.name)}` : '',
    event.virtual_url ? `URL:${event.virtual_url}` : '',
    `DTSTAMP:${formatICSDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n')
  
  return icsContent
}

export function downloadICSFile(event: Event): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const icsContent = generateICSEvent(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateOutlookLink(event: Event): string {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location: event.venue?.name || event.virtual_url || ''
  })
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

export function generateYahooLink(event: Event): string {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  
  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: event.title,
    st: startDate.toISOString(),
    et: endDate.toISOString(),
    desc: event.description || '',
    in_loc: event.venue?.name || event.virtual_url || ''
  })
  
  return `https://calendar.yahoo.com/?${params.toString()}`
}

export function shareToCalendar(event: Event, provider: 'google' | 'outlook' | 'yahoo' | 'ics'): void {
  switch (provider) {
    case 'google':
  if (typeof window !== 'undefined') window.open(generateGoogleCalendarLink(event), '_blank')
      break
    case 'outlook':
  if (typeof window !== 'undefined') window.open(generateOutlookLink(event), '_blank')
      break
    case 'yahoo':
  if (typeof window !== 'undefined') window.open(generateYahooLink(event), '_blank')
      break
    case 'ics':
      downloadICSFile(event)
      break
  }
}

export function generateEventShareText(event: Event): string {
  const startDate = new Date(event.start_time)
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  let text = `Check out this event: ${event.title}\n`
  text += `📅 ${dateStr} at ${timeStr}\n`
  
  if (event.venue) {
    text += `📍 ${event.venue.name}`
    if (event.venue.room_number) {
      text += ` - ${event.venue.room_number}`
    }
    text += '\n'
  }
  
  if (event.virtual_url) {
    text += `🔗 Virtual Event: ${event.virtual_url}\n`
  }
  
  if (event.description) {
    text += `\n${event.description.substring(0, 200)}${event.description.length > 200 ? '...' : ''}\n`
  }
  
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  text += `\nView more details: ${origin}/events/${event.slug}`
  
  return text
}

export function shareToSocialMedia(event: Event, platform: 'twitter' | 'facebook' | 'linkedin'): void {
  const text = generateEventShareText(event)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${origin}/events/${event.slug}`
  
  switch (platform) {
    case 'twitter':
      const twitterText = encodeURIComponent(text.substring(0, 200))
      if (typeof window !== 'undefined') window.open(`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(url)}`, '_blank')
      break
    case 'facebook':
      if (typeof window !== 'undefined') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
      break
    case 'linkedin':
      if (typeof window !== 'undefined') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
      break
  }
}

export function copyEventLink(event: Event): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${origin}/events/${event.slug}`
  if (typeof navigator !== 'undefined' && navigator.clipboard) return navigator.clipboard.writeText(url)
  return Promise.reject(new Error('Clipboard not available'))
}

export function generateEventQRCode(event: Event): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${origin}/events/${event.slug}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
}
