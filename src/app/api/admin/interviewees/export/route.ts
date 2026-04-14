import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const eid = sp.get('eid') || null
  const department = sp.get('department') || null
  const ratingMin = sp.get('rating_min') ? parseFloat(sp.get('rating_min')!) : null
  const ratingMax = sp.get('rating_max') ? parseFloat(sp.get('rating_max')!) : null
  const interviewMin = sp.get('interview_min') ? parseInt(sp.get('interview_min')!) : null
  const interviewMax = sp.get('interview_max') ? parseInt(sp.get('interview_max')!) : null

  try {
    // Fetch all matching interviewees (no pagination limit)
    const { data, error } = await supabase.rpc('get_admin_interviewees', {
      p_eid: eid,
      p_department: department,
      p_rating_min: ratingMin,
      p_rating_max: ratingMax,
      p_interview_min: interviewMin,
      p_interview_max: interviewMax,
      p_limit: 10000, // Large limit for export
      p_offset: 0,
    })

    if (error) throw error

    const rows = data?.rows || []

    // Generate CSV
    const headers = [
      'EID',
      '部門',
      '综合評級',
      '採訪次数',
      '最新日期',
      'P1',
      'P2',
      'P3',
      'P4',
      '技術力平均',
      '表現力平均',
      '論理力平均',
      '日本語平均',
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(
        (r: any) => [
          r.eid,
          r.department || '',
          r.comprehensive_rating,
          r.total_interviews,
          r.latest_interview_date ? new Date(r.latest_interview_date).toLocaleDateString('ja-JP') : '',
          r.p1_count,
          r.p2_count,
          r.p3_count,
          r.p4_count,
          r.avg_technical_score,
          r.avg_expression_score,
          r.avg_logic_score,
          r.avg_japanese_score,
        ]
          .map(v => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
          .join(',')
      ),
    ].join('\n')

    // Generate BOM for UTF-8 with proper Excel encoding
    const utf8BOM = '\uFEFF'
    const csvWithBOM = utf8BOM + csvContent

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="interviewees_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
