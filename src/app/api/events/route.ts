import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eventFormSchema, validateFormData } from '@/lib/utils/validation'

export async function GET(request: NextRequest) {
  try {
  const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const interest = searchParams.get('interest')
    const club = searchParams.get('club')
    const search = searchParams.get('search')
    const upcoming = searchParams.get('upcoming') === 'true'

    // Build server-side query with filters and pagination
    let query = supabase.from('events').select(`
      *,
      categories:event_categories(category:categories(*)),
      interests:event_interests(interest:interests(*))
    `)

    if (upcoming) {
      query = query.gte('start_time', new Date().toISOString())
    }

    if (club) {
      query = query.eq('club_id', club)
    }

    if (search) {
      query = query.ilike('title', `%${search}%`).or(`description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: eventsData, error } = await (query.range(from, to) as any)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const transformed = (eventsData || []).map((e: any) => ({
      ...e,
      categories: (e.categories || []).map((ec: any) => ec.category || ec.category_id).filter(Boolean),
      interests: (e.interests || []).map((ei: any) => ei.interest || ei.interest_id).filter(Boolean),
    }))

    return NextResponse.json({ data: transformed })
  } catch (err) {
    console.error('Error fetching events:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
  const supabase = await createClient()
    
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
      } as any] as any[])
      .select()
      .single() as any

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Add categories
    if (eventData.category_ids.length > 0) {
      const categoryInserts = eventData.category_ids.map(categoryId => ({
        event_id: event.id,
        category_id: categoryId
      })) as any[]

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
      })) as any[]

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
