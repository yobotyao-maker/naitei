import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp     = req.nextUrl.searchParams
  const eid    = sp.get('eid')    || null
  const pLevel = sp.get('p_level') || null
  const from   = sp.get('from')   || null
  const to     = sp.get('to')     || null
  const page   = parseInt(sp.get('page') || '0')
  const limit  = 50

  try {
    let query = supabase
      .from('design_sessions')
      .select('*', { count: 'exact' })
      .eq('status', 'completed')

    // フィルター
    if (eid) {
      query = query.or(`interviewer_eid.ilike.%${eid}%,interviewee_eid.ilike.%${eid}%`)
    }
    if (pLevel) {
      query = query.eq('p_level', pLevel)
    }
    if (from) {
      query = query.gte('created_at', `${from}T00:00:00`)
    }
    if (to) {
      query = query.lte('created_at', `${to}T23:59:59`)
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
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
