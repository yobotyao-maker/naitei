import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import QuestionManager from '@/components/admin/QuestionManager'

export const revalidate = 0

export default async function QuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !await isAdmin(supabase, user.id)) redirect('/auth')

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">問題管理</h1>
        <p className="text-xs text-gray-400 mt-1">設計コースの出題問題を追加・編集・削除できます</p>
      </div>
      <QuestionManager />
    </div>
  )
}
