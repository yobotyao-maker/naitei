import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function adminGuard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id)) return null
  return user
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eid: string }> }
) {
  if (!await adminGuard())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { eid } = await params
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_admin_interviewee_detail', { p_eid: eid })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eid: string }> }
) {
  if (!await adminGuard())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { eid } = await params
  const body = await req.json()
  const { department } = body

  try {
    // Update all design_sessions records with this interviewee_eid
    if (department) {
      const { error: updateError } = await service()
        .from('design_sessions')
        .update({ department })
        .eq('interviewee_eid', eid)

      if (updateError) throw updateError
    }

    // Get updated interviewee detail
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_admin_interviewee_detail', { p_eid: eid })
    if (error) throw error

    return NextResponse.json(data)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
