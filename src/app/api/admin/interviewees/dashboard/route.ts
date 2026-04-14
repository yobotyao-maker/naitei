import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { data, error } = await supabase.rpc('get_admin_interviewees_stats')

    if (error) throw error

    return NextResponse.json(data)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
