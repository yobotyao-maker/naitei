import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Verify admin token or API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false
      }
    })

    // SQL statements to execute
    const statements = [
      `UPDATE interviews
       SET eid = 'EID_' || LPAD(
         (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
         6,
         '0'
       )
       WHERE eid IS NULL`,

      `UPDATE design_sessions
       SET interviewee_eid = 'EID_' || LPAD(
         (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
         6,
         '0'
       )
       WHERE interviewee_eid IS NULL`,

      `SELECT
         'interviews' as table_name,
         COUNT(*) as total_records,
         COUNT(CASE WHEN eid IS NOT NULL THEN 1 END) as eid_populated,
         COUNT(DISTINCT eid) as unique_eids
       FROM interviews
       UNION ALL
       SELECT
         'design_sessions' as table_name,
         COUNT(*) as total_records,
         COUNT(CASE WHEN interviewee_eid IS NOT NULL THEN 1 END) as eid_populated,
         COUNT(DISTINCT interviewee_eid) as unique_eids
       FROM design_sessions`
    ]

    const results = []

    for (const sql of statements) {
      const { data, error } = await supabase.rpc('execute_sql', { sql })

      if (error) {
        console.error('SQL Error:', error)
        results.push({ sql: sql.substring(0, 50), error: error.message })
      } else {
        results.push({ sql: sql.substring(0, 50), data })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
