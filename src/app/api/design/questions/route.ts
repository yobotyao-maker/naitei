import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('design_questions')
      .select('*')
      .order('number')

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
