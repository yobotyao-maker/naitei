import { createClient } from '@/lib/supabase-server'
import UserPlanEditor from '@/components/admin/UserPlanEditor'

export const revalidate = 30

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('subscriptions')
    .select('user_id, plan, interviews_used, interviews_limit, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">プラン管理</h1>
      <UserPlanEditor users={users ?? []} />
    </div>
  )
}
