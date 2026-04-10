import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const email = sp.get('email') || null
  const eid = sp.get('eid') || null
  const page = parseInt(sp.get('page') || '0')
  const limit = 50

  try {
    let query = supabase
      .from('feedback')
      .select('*', { count: 'exact' })

    // フィルター
    if (email) {
      query = query.ilike('email', `%${email}%`)
    }
    if (eid) {
      query = query.ilike('eid', `%${eid}%`)
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
