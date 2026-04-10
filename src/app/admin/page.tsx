import { createClient } from '@/lib/supabase-server'
import AdminDashboard from '@/components/AdminDashboard'

export const revalidate = 30

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { data: stats },
    { data: designStats },
    { data: recent },
    { data: recentDesign },
  ] = await Promise.all([
    supabase.rpc('get_admin_stats'),
    supabase.rpc('get_design_stats'),
    supabase.from('interviews').select('id, job_role, score, level, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('design_sessions').select('id, selected_domains, total_score, p_level, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">ダッシュボード</h1>
      <AdminDashboard
        stats={stats}
        designStats={designStats}
        recent={recent ?? []}
        recentDesign={recentDesign ?? []}
      />
    </div>
  )
}
