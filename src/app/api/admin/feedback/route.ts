import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const feedbackType = sp.get('feedback_type') || null
  const minRating = parseInt(sp.get('min_rating') || '0')
  const page = parseInt(sp.get('page') || '0')
  const limit = 20

  try {
    let query = supabase
      .from('design_feedback')
      .select(`
        id,
        session_id,
        user_id,
        feedback_text,
        rating,
        feedback_type,
        created_at,
        design_sessions (
          id,
          interviewer_eid,
          interviewee_eid,
          department,
          p_level
        )
      `, { count: 'exact' })

    if (feedbackType) {
      query = query.eq('feedback_type', feedbackType)
    }
    if (minRating > 0) {
      query = query.gte('rating', minRating)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) throw error

    return NextResponse.json({
      total: count || 0,
      rows: data || [],
      page,
      limit,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const { error } = await supabase
      .from('design_feedback')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
