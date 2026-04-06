import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp      = req.nextUrl.searchParams
  const keyword = sp.get('keyword') || null
  const level   = sp.get('level')   || null
  const from    = sp.get('from')    || null
  const to      = sp.get('to')      || null
  const page    = parseInt(sp.get('page') || '0')
  const limit   = 20

  const { data, error } = await supabase.rpc('search_interviews', {
    p_keyword: keyword,
    p_level:   level,
    p_from:    from,
    p_to:      to,
    p_limit:   limit,
    p_offset:  page * limit,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, page, limit })
}
