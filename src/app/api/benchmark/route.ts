import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const jobRole = req.nextUrl.searchParams.get('role')
  if (!jobRole) return NextResponse.json({ error: 'role required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_benchmark', { p_job_role: jobRole })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.count < 5) {
    return NextResponse.json({ available: false })
  }

  return NextResponse.json({ available: true, ...data })
}
