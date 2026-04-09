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

export async function GET() {
  if (!await adminGuard())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await service()
    .from('design_questions')
    .select('*')
    .order('number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!await adminGuard())
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { number, category, content, complexity, is_required, display_order, design_domains } = body

  if (!number || !category || !content)
    return NextResponse.json({ error: 'number, category, content は必須です' }, { status: 400 })

  const { data, error } = await service()
    .from('design_questions')
    .insert({
      number:         Number(number),
      category,
      content,
      complexity:     complexity || null,
      is_required:    is_required ?? false,
      display_order:  display_order || null,
      design_domains: design_domains ?? [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ question: data })
}
