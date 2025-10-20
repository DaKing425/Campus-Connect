import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
  const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, status } = body

    if (!event_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if event exists and is approved
    const evRes = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('status', 'approved')
      .single() as any

    const event = evRes.data as any
    const eventError = evRes.error as any

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event is upcoming
    if (new Date(event.start_time) <= new Date()) {
      return NextResponse.json({ error: 'Cannot RSVP to past events' }, { status: 400 })
    }

    // Check if RSVP deadline has passed
    if (event.rsvp_close_time && new Date(event.rsvp_close_time) <= new Date()) {
      return NextResponse.json({ error: 'RSVP deadline has passed' }, { status: 400 })
    }

    // Check existing RSVP
    const existingRes = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single() as any

    const existingRSVP = existingRes.data as any

    if (existingRSVP && existingRSVP.status !== 'cancelled') {
      return NextResponse.json({ error: 'Already RSVP\'d to this event' }, { status: 400 })
    }

    // Check capacity and waitlist
    const rsvpCountRes = await supabase
      .from('rsvps')
      .select('*', { count: 'exact' })
      .eq('event_id', event_id)
      .eq('status', 'going') as any

    const rsvpCount = rsvpCountRes.data as any[]

    const currentCount = rsvpCount?.length || 0
    const capacity = event.capacity
    const buffer = event.rsvp_buffer || 0
    const maxCapacity = capacity ? capacity + buffer : null

    let finalStatus = status
    let waitlistPosition = null

    // Handle capacity limits
    if (maxCapacity && currentCount >= maxCapacity) {
      if (event.is_waitlist_enabled) {
        finalStatus = 'waitlisted'
        
        // Get waitlist position
        const waitlistRes = await supabase
          .from('rsvps')
          .select('*', { count: 'exact' })
          .eq('event_id', event_id)
          .eq('status', 'waitlisted') as any

        const waitlistCount = waitlistRes.data as any[]
        waitlistPosition = (waitlistCount?.length || 0) + 1
      } else {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 })
      }
    }

    // Create or update RSVP
    const rsvpData = {
      user_id: user.id,
      event_id: event_id,
      status: finalStatus,
      rsvp_time: new Date().toISOString(),
      cancelled_at: null,
      waitlist_position: waitlistPosition,
      promotion_expires_at: null,
    }

    let result
    if (existingRSVP) {
      // Update existing RSVP
      const upRes = await supabase
        .from('rsvps')
        .update(rsvpData as any)
        .eq('id', existingRSVP.id)
        .select()
        .single() as any

      if (upRes.error) throw upRes.error
      result = upRes.data
    } else {
      // Create new RSVP
      const insRes = await supabase
        .from('rsvps')
        .insert([rsvpData] as any[])
        .select()
        .single() as any

      if (insRes.error) throw insRes.error
      result = insRes.data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
  const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')

    if (!event_id) {
      return NextResponse.json({ error: 'Missing event_id' }, { status: 400 })
    }

    // Find existing RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single()

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }

    // Cancel RSVP
    const { error: updateError } = await supabase
      .from('rsvps')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        waitlist_position: null,
        promotion_expires_at: null,
      })
      .eq('id', rsvp.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If this RSVP was a confirmed 'going' RSVP, promote the first waitlisted attendee
    try {
      if (rsvp.status === 'going') {
        const waitlistedRes = await supabase
          .from('rsvps')
          .select('*')
          .eq('event_id', rsvp.event_id)
          .eq('status', 'waitlisted')
          .order('rsvp_time', { ascending: true })
          .limit(1)

        if (!waitlistedRes.error && Array.isArray(waitlistedRes.data) && waitlistedRes.data.length > 0) {
          const promote = waitlistedRes.data[0]

          // Promote to 'going'
          const promoteRes = await supabase
            .from('rsvps')
            .update({ status: 'going', waitlist_position: null, promotion_expires_at: null })
            .eq('id', promote.id)
            .eq('status', 'waitlisted')

          // ignore promotion errors but log them
          if (promoteRes.error) console.error('Failed to promote waitlisted user:', promoteRes.error)
        }
      }
    } catch (e) {
      console.error('Error during waitlist promotion:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
