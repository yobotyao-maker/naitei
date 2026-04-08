import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id)) return null
  return user
}

// GET /api/admin/admins — list all admins
export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const service = getServiceClient()
  const { data, error } = await service
    .from('admins')
    .select('user_id, email, created_at')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ admins: data })
}

// POST /api/admin/admins — add admin { email }
export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const service = getServiceClient()
  // look up user by email
  const { data: { users }, error: listError } = await service.auth.admin.listUsers({ perPage: 1000 })
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const found = users.find(u => u.email === email)
  if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await service
    .from('admins')
    .insert({ user_id: found.id, email: found.email })
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'User is already an admin' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, user_id: found.id, email: found.email })
}

// DELETE /api/admin/admins?user_id=xxx — remove admin
export async function DELETE(req: NextRequest) {
  const currentUser = await verifyAdmin()
  if (!currentUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  if (userId === currentUser.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }
  const service = getServiceClient()
  const { error } = await service
    .from('admins')
    .delete()
    .eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
