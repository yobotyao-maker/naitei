import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyAdmin(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id)) return null
  return user
}

// GET /api/admin/users — 列出所有用户
export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const admin = getAdmin()
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 100 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  })))
}

const PLAN_LIMITS: Record<string, number> = { free: 1, pack: 6, pro: 9999 }

// POST /api/admin/users
//   { email, password }             → 创建用户
//   { userId, plan, customLimit? }  → 调整套餐
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()

  // 调整套餐
  if (body.userId) {
    const { userId, plan, customLimit } = body
    if (!plan) return NextResponse.json({ error: 'plan required' }, { status: 400 })
    const supabase = await createClient()
    const { error } = await supabase.rpc('admin_set_plan', {
      p_user_id: userId,
      p_plan:    plan,
      p_limit:   customLimit ?? PLAN_LIMITS[plan] ?? 1,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // 创建用户
  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }
  const admin = getAdmin()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.user.id, email: data.user.email })
}

// PATCH /api/admin/users — 重置密码 { id, password }
export async function PATCH(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id, password } = await req.json()
  if (!id || !password) {
    return NextResponse.json({ error: 'id and password required' }, { status: 400 })
  }
  const admin = getAdmin()
  const { error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/users?id=xxx — 删除用户
export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const admin = getAdmin()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
