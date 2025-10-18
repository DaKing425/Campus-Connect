// Supabase Edge Function for waitlist promotion
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

    // Find events with waitlisted users
    const { data: waitlistedRSVPs, error: rsvpError } = await supabaseClient
      .from('rsvps')
      .select(`
        *,
        event:events(*),
        user:profiles(*)
      `)
      .eq('status', 'waitlisted')
      .order('rsvp_time', { ascending: true })

    if (rsvpError) {
      throw rsvpError
    }

    // Group by event
    const eventsMap = new Map()
    waitlistedRSVPs?.forEach(rsvp => {
      if (!eventsMap.has(rsvp.event_id)) {
        eventsMap.set(rsvp.event_id, [])
      }
      eventsMap.get(rsvp.event_id).push(rsvp)
    })

    // Process each event
    for (const [eventId, rsvps] of eventsMap) {
      const event = rsvps[0].event
      
      // Check current capacity
      const { data: currentRSVPs, error: currentError } = await supabaseClient
        .from('rsvps')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'going')

      if (currentError) continue

      const currentCount = currentRSVPs?.length || 0
      const capacity = event.capacity
      const buffer = event.rsvp_buffer || 0
      const maxCapacity = capacity ? capacity + buffer : null

      // If there's space, promote the next person
      if (!maxCapacity || currentCount < maxCapacity) {
        const nextRSVP = rsvps[0] // First in line
        
        // Promote to going
        const { error: promoteError } = await supabaseClient
          .from('rsvps')
          .update({
            status: 'going',
            waitlist_position: null,
            promotion_expires_at: null
          })
          .eq('id', nextRSVP.id)

        if (!promoteError) {
          // Send notification to user
          await supabaseClient
            .from('notifications')
            .insert([{
              user_id: nextRSVP.user_id,
              type: 'waitlist_promotion',
              title: 'You\'re in!',
              body: `You've been promoted from the waitlist for "${event.title}".`,
              entity_type: 'event',
              entity_id: eventId
            }])

          // Update waitlist positions for remaining users
          const remainingRSVPs = rsvps.slice(1)
          for (let i = 0; i < remainingRSVPs.length; i++) {
            await supabaseClient
              .from('rsvps')
              .update({
                waitlist_position: i + 1
              })
              .eq('id', remainingRSVPs[i].id)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: eventsMap.size }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing waitlist:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
