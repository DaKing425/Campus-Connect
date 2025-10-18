import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
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
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('status', 'approved')
      .single()

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
    const { data: existingRSVP } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single()

    if (existingRSVP && existingRSVP.status !== 'cancelled') {
      return NextResponse.json({ error: 'Already RSVP\'d to this event' }, { status: 400 })
    }

    // Check capacity and waitlist
    const { data: rsvpCount } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact' })
      .eq('event_id', event_id)
      .eq('status', 'going')

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
        const { data: waitlistCount } = await supabase
          .from('rsvps')
          .select('*', { count: 'exact' })
          .eq('event_id', event_id)
          .eq('status', 'waitlisted')
        
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
      const { data, error } = await supabase
        .from('rsvps')
        .update(rsvpData)
        .eq('id', existingRSVP.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new RSVP
      const { data, error } = await supabase
        .from('rsvps')
        .insert([rsvpData])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
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

    // TODO: Handle waitlist promotion if this was a confirmed RSVP

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
