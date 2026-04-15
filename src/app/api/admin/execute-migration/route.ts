'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@naitei.ai'
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    console.log('🚀 Starting EID population migration...')

    // Execute migration statements
    const results = {
      interviews_updated: 0,
      design_sessions_updated: 0,
      errors: [] as string[]
    }

    // Step 1: Update interviews.eid
    try {
      const { error: error1 } = await supabase.rpc('execute_sql', {
        sql: `UPDATE interviews
              SET eid = 'EID_' || LPAD(
                (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
                6,
                '0'
              )
              WHERE eid IS NULL`
      }).catch(async () => {
        // Fallback: Try direct query approach
        const { count, error } = await supabase.rpc('execute_migration_interviews')
        return { error }
      })

      if (error1) {
        results.errors.push(`interviews.eid update: ${error1.message}`)
      }
    } catch (e) {
      results.errors.push(`interviews.eid update failed: ${String(e)}`)
    }

    // Step 2: Update design_sessions.interviewee_eid
    try {
      const { error: error2 } = await supabase.rpc('execute_sql', {
        sql: `UPDATE design_sessions
              SET interviewee_eid = 'EID_' || LPAD(
                (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
                6,
                '0'
              )
              WHERE interviewee_eid IS NULL`
      }).catch(async () => {
        const { count, error } = await supabase.rpc('execute_migration_design_sessions')
        return { error }
      })

      if (error2) {
        results.errors.push(`design_sessions.interviewee_eid update: ${error2.message}`)
      }
    } catch (e) {
      results.errors.push(`design_sessions update failed: ${String(e)}`)
    }

    // Step 3: Verify results
    try {
      const { data: interviewsCount } = await supabase
        .from('interviews')
        .select('eid', { count: 'exact', head: true })
        .not('eid', 'is', null)

      const { data: designSessionsCount } = await supabase
        .from('design_sessions')
        .select('interviewee_eid', { count: 'exact', head: true })
        .not('interviewee_eid', 'is', null)

      results.interviews_updated = interviewsCount?.length || 0
      results.design_sessions_updated = designSessionsCount?.length || 0
    } catch (e) {
      results.errors.push(`Verification failed: ${String(e)}`)
    }

    const success = results.errors.length === 0

    return NextResponse.json({
      success,
      message: success
        ? '✓ EID migration completed successfully'
        : '⚠ Migration completed with some warnings',
      results
    }, {
      status: success ? 200 : 206
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Migration failed - check logs or execute SQL manually in Supabase console'
    }, {
      status: 500
    })
  }
}
