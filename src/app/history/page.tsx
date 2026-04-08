import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { redirect } from 'next/navigation'
import { P_LEVEL_LABELS } from '@/lib/design-scoring'

const levelColor: Record<string, string> = {
  S1: 'text-red-500 bg-red-50',
  S2: 'text-orange-400 bg-orange-50',
  S3: 'text-blue-500 bg-blue-50',
  S4: 'text-yellow-500 bg-yellow-50',
}

const pLevelColor: Record<string, string> = {
  P1: 'text-gray-500 bg-gray-50',
  P2: 'text-blue-500 bg-blue-50',
  P3: 'text-green-600 bg-green-50',
  P4: 'text-purple-600 bg-purple-50',
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { tab } = await searchParams
  const activeTab = tab === 'design' ? 'design' : 'interview'

  // ── 面接履歴 ────────────────────────────────────────────────
  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // ── 設計コース履歴 ───────────────────────────────────────────
  const { data: designSessions } = await supabase
    .from('design_sessions')
    .select('id, selected_domains, background_score, technical_score, total_score, p_level, status, created_at, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  const interviewAvg = interviews?.length
    ? (interviews.reduce((s, i) => s + (i.score ?? 0), 0) / interviews.length).toFixed(1)
    : null

  const designAvg = designSessions?.length
    ? Math.round(designSessions.reduce((s, d) => s + (d.total_score ?? 0), 0) / designSessions.length)
    : null

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex gap-2">
            <Link
              href="/design"
              className="text-sm font-medium px-3 py-2 rounded-xl border border-[#2D5BE3] text-[#2D5BE3] hover:bg-blue-50 transition-colors"
            >
              設計コース
            </Link>
            <Link
              href="/interview"
              className="bg-[#2D5BE3] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              + 面接練習
            </Link>
          </div>
        </div>

        <h1 className="text-xl font-medium text-gray-900 mb-1">履歴</h1>
        <p className="text-sm text-gray-400 mb-6">{user.email}</p>

        {/* タブ */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6">
          <Link
            href="/history?tab=interview"
            className={`flex-1 text-center text-sm font-medium py-2 rounded-xl transition-all ${
              activeTab === 'interview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            面接練習
          </Link>
          <Link
            href="/history?tab=design"
            className={`flex-1 text-center text-sm font-medium py-2 rounded-xl transition-all ${
              activeTab === 'design'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            設計コース
          </Link>
        </div>

        {/* ── 面接練習タブ ── */}
        {activeTab === 'interview' && (
          <>
            {interviews && interviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-medium text-gray-900">{interviews.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">総練習回数</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-medium text-[#2D5BE3]">{interviewAvg}</div>
                  <div className="text-xs text-gray-400 mt-0.5">平均スコア</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-medium text-gray-900">{interviews[0]?.level ?? '-'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">最新レベル</div>
                </div>
              </div>
            )}

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
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
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
          </>
        )}

        {/* ── 設計コースタブ ── */}
        {activeTab === 'design' && (
          <>
            {designSessions && designSessions.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-medium text-gray-900">{designSessions.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">受験回数</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-medium text-[#2D5BE3]">{designAvg}</div>
                  <div className="text-xs text-gray-400 mt-0.5">平均スコア/80</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                  <div className={`text-2xl font-medium ${P_LEVEL_LABELS[designSessions[0]?.p_level ?? 'P1']?.color ?? 'text-gray-500'}`}>
                    {designSessions[0]?.p_level ?? '-'}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">最新Pレベル</div>
                </div>
              </div>
            )}

            {!designSessions || designSessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
                <div className="text-4xl mb-3">📐</div>
                <p className="text-gray-500 font-medium mb-1">設計コースの受験記録がありません</p>
                <p className="text-sm text-gray-400 mb-5">設計面談を体験してみましょう</p>
                <Link href="/design" className="bg-[#2D5BE3] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block">
                  設計コースを始める →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {designSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(session.selected_domains as string[] ?? []).slice(0, 3).map((d: string) => (
                            <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{d}</span>
                          ))}
                          {(session.selected_domains as string[] ?? []).length > 3 && (
                            <span className="text-xs text-gray-400">+{(session.selected_domains as string[]).length - 3}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(session.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pLevelColor[session.p_level] ?? 'text-gray-500 bg-gray-50'}`}>
                          {session.p_level}
                        </span>
                        <span className="text-lg font-medium text-gray-900">{session.total_score}<span className="text-xs text-gray-400">/80</span></span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>背景: {session.background_score}/30</span>
                      <span>技術: {session.technical_score}/50</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
