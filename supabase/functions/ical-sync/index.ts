// Supabase Edge Function for ICS calendar sync
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active event sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('event_sources')
      .select('*')
      .not('url', 'is', null)

    if (sourcesError) {
      throw sourcesError
    }

    let totalProcessed = 0
    let totalCreated = 0

    // Process each source
    for (const source of sources || []) {
      try {
        // Fetch ICS data
        const response = await fetch(source.url)
        if (!response.ok) continue

        const icsData = await response.text()
        const events = parseICS(icsData)

        // Process each event
        for (const event of events) {
          // Check if event already exists
          const { data: existingEvent } = await supabaseClient
            .from('events')
            .select('id')
            .eq('source_id', source.id)
            .eq('ical_uid', event.uid)
            .single()

          if (existingEvent) continue

          // Create new event
          const { error: createError } = await supabaseClient
            .from('events')
            .insert([{
              title: event.summary,
              description: event.description,
              start_time: event.start,
              end_time: event.end,
              timezone: 'America/Los_Angeles',
              venue_id: null,
              virtual_url: event.url,
              visibility: 'public',
              status: 'approved',
              ical_uid: event.uid,
              source_id: source.id,
              created_by: null, // System created
              slug: generateSlug(event.summary)
            }])

          if (!createError) {
            totalCreated++
          }
        }

        // Update last sync time
        await supabaseClient
          .from('event_sources')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', source.id)

        totalProcessed++
      } catch (error) {
        console.error(`Error processing source ${source.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sourcesProcessed: totalProcessed,
        eventsCreated: totalCreated 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error syncing calendars:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Simple ICS parser
function parseICS(icsData: string) {
  const events = []
  const lines = icsData.split('\n')
  let currentEvent = null

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine === 'BEGIN:VEVENT') {
      currentEvent = {}
    } else if (trimmedLine === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent)
        currentEvent = null
      }
    } else if (currentEvent) {
      const [key, ...valueParts] = trimmedLine.split(':')
      const value = valueParts.join(':')
      
      switch (key) {
        case 'SUMMARY':
          currentEvent.summary = value
          break
        case 'DESCRIPTION':
          currentEvent.description = value
          break
        case 'DTSTART':
          currentEvent.start = parseICSDate(value)
          break
        case 'DTEND':
          currentEvent.end = parseICSDate(value)
          break
        case 'UID':
          currentEvent.uid = value
          break
        case 'URL':
          currentEvent.url = value
          break
      }
    }
  }

  return events
}

function parseICSDate(dateStr: string): string {
  // Handle different ICS date formats
  if (dateStr.includes('T')) {
    // DateTime format: 20240101T120000Z
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    const hour = dateStr.substring(9, 11)
    const minute = dateStr.substring(11, 13)
    const second = dateStr.substring(13, 15)
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
  } else {
    // Date format: 20240101
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    
    return `${year}-${month}-${day}T00:00:00Z`
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
