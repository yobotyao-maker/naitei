import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// design_questions は公開マスターデータ — service role で RLS をバイパス
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('design_questions')
      .select('*')
      .order('number')

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('[design/questions GET]', e)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
