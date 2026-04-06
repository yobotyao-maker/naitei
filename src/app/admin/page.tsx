import { createClient } from '@/lib/supabase-server'
import AdminDashboard from '@/components/AdminDashboard'

export const revalidate = 30

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: stats } = await supabase.rpc('get_admin_stats')

  const { data: recent } = await supabase
    .from('interviews')
    .select('id, job_role, score, level, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: users } = await supabase
    .from('subscriptions')
    .select('user_id, plan, interviews_used, interviews_limit, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">ダッシュボード</h1>
      <AdminDashboard
        stats={stats}
        recent={recent ?? []}
        users={users ?? []}
      />
    </div>
  )
}
