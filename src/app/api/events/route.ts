import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema, validateFormData } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const interest = searchParams.get('interest')
    const club = searchParams.get('club')
    const search = searchParams.get('search')
    const upcoming = searchParams.get('upcoming') === 'true'
    
    let query = supabase
      .from('events')
      .select(`
        *,
        club:clubs(*),
        venue:venues(*),
        categories:event_categories(category:categories(*)),
        interests:event_interests(interest:interests(*))
      `)
      .eq('status', 'approved')
      .order('start_time', { ascending: true })

    // Apply filters
    if (upcoming) {
      query = query.gte('start_time', new Date().toISOString())
    }

    if (category) {
      query = query.in('id', 
        supabase
          .from('event_categories')
          .select('event_id')
          .eq('category_id', category)
      )
    }

    if (interest) {
      query = query.in('id',
        supabase
          .from('event_interests')
          .select('event_id')
          .eq('interest_id', interest)
      )
    }

    if (club) {
      query = query.eq('club_id', club)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data
    const transformedEvents = events?.map(event => ({
      ...event,
      categories: event.categories?.map((ec: any) => ec.category).filter(Boolean) || [],
      interests: event.interests?.map((ei: any) => ei.interest).filter(Boolean) || [],
    })) || []

    return NextResponse.json({ data: transformedEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate form data
    const validation = validateFormData(eventFormSchema, body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 })
    }

    const eventData = validation.data!

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_by: user.id,
        slug: eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'pending_approval',
      }])
      .select()
      .single()

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Add categories
    if (eventData.category_ids.length > 0) {
      const categoryInserts = eventData.category_ids.map(categoryId => ({
        event_id: event.id,
        category_id: categoryId
      }))

      const { error: categoryError } = await supabase
        .from('event_categories')
        .insert(categoryInserts)

      if (categoryError) {
        console.error('Error adding categories:', categoryError)
      }
    }

    // Add interests
    if (eventData.interest_ids && eventData.interest_ids.length > 0) {
      const interestInserts = eventData.interest_ids.map(interestId => ({
        event_id: event.id,
        interest_id: interestId
      }))

      const { error: interestError } = await supabase
        .from('event_interests')
        .insert(interestInserts)

      if (interestError) {
        console.error('Error adding interests:', interestError)
      }
    }

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
