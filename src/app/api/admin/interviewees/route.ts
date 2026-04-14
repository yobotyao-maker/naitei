import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp    = req.nextUrl.searchParams
  const eid   = sp.get('eid')   || null
  const page  = parseInt(sp.get('page') || '0')
  const limit = 20

  try {
    const offset = page * limit
    const { data, error } = await supabase.rpc('get_admin_interviewees', {
      p_eid:    eid,
      p_limit:  limit,
      p_offset: offset,
    })

    if (error) throw error

    // Supabase RPC returns { total, rows } structure
    return NextResponse.json({
      total: data?.total || 0,
      rows: data?.rows || [],
      page,
      limit,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
