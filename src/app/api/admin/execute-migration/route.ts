import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Return migration instructions
    const migrationSQL = `-- Update interviews.eid
UPDATE interviews
SET eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE eid IS NULL;

-- Update design_sessions.interviewee_eid
UPDATE design_sessions
SET interviewee_eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE interviewee_eid IS NULL;

-- Verify results
SELECT
  'interviews' as table_name,
  COUNT(*) as total,
  COUNT(eid) as with_eid
FROM interviews
UNION ALL
SELECT
  'design_sessions' as table_name,
  COUNT(*) as total,
  COUNT(interviewee_eid) as with_eid
FROM design_sessions;`

    return NextResponse.json({
      success: true,
      message: 'Execute this SQL in Supabase SQL Editor',
      instructions: {
        step1: 'Visit https://app.supabase.com/',
        step2: 'Select your "naitei" project',
        step3: 'Go to SQL Editor → New Query',
        step4: 'Paste and run the provided SQL'
      },
      sql: migrationSQL
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    })
  }
}
