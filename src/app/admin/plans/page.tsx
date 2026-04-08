import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import UserPlanEditor from '@/components/admin/UserPlanEditor'

export const revalidate = 0

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id)) redirect('/auth')

  // SECURITY DEFINER RPC でRLSをバイパスして全ユーザーのプランを取得
  const { data: users } = await supabase.rpc('get_admin_subscriptions')

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">プラン管理</h1>
      <UserPlanEditor users={users ?? []} />
    </div>
  )
}
