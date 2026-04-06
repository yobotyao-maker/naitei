import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { redirect } from 'next/navigation'

const levelColor: Record<string, string> = {
  S1: 'text-red-500 bg-red-50',
  S2: 'text-orange-400 bg-orange-50',
  S3: 'text-blue-500 bg-blue-50',
  S4: 'text-yellow-500 bg-yellow-50',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const avg = interviews?.length
    ? (interviews.reduce((s, i) => s + (i.score ?? 0), 0) / interviews.length).toFixed(1)
    : null

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <Link href="/interview" className="bg-[#2D5BE3] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            + 新しい練習
          </Link>
        </div>

        <h1 className="text-xl font-medium text-gray-900 mb-1">練習履歴</h1>
        <p className="text-sm text-gray-400 mb-6">{user.email}</p>

        {/* Summary cards */}
        {interviews && interviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-medium text-gray-900">{interviews.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">総練習回数</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-medium text-[#2D5BE3]">{avg}</div>
              <div className="text-xs text-gray-400 mt-0.5">平均スコア</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-medium text-gray-900">
                {interviews[0]?.level ?? '-'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">最新レベル</div>
            </div>
          </div>
        )}

        {/* List */}
        {!interviews || interviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 font-medium mb-1">まだ練習記録がありません</p>
            <p className="text-sm text-gray-400 mb-5">最初の面接練習を始めましょう</p>
            <Link href="/interview" className="bg-[#2D5BE3] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block">
              練習を始める →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.job_role}</span>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColor[item.level] ?? 'text-gray-500 bg-gray-50'}`}>
                      {item.level}
                    </span>
                    <span className="text-lg font-medium text-gray-900">{item.score?.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{item.question}</p>
                {item.feedback && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-700 leading-relaxed">{item.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
