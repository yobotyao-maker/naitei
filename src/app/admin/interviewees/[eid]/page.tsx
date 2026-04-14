import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function IntervieweeDetailPage({
  params,
}: {
  params: Promise<{ eid: string }>
}) {
  const { eid } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch interviewee detail
  const { data: detail, error } = await supabase.rpc('get_admin_interviewee_detail', { p_eid: eid })

  if (error || !detail?.interviewee) {
    notFound()
  }

  const interviewee = detail.interviewee
  const interviews = detail.interviews || []
  const designSessions = detail.design_sessions || []

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/admin/interviewees" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">面試者詳細</h1>
      </div>

      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block mb-3">
              {eid}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{interviewee.comprehensive_rating.toFixed(1)}</h2>
            <p className="text-sm text-gray-600">総合評級</p>
          </div>
          <div className="text-right space-y-2">
            {interviewee.department && (
              <div className="text-sm text-gray-600">{interviewee.department}</div>
            )}
            <div className="text-2xl font-bold text-gray-700">{interviewee.total_interviews}</div>
            <div className="text-xs text-gray-400">採訪数</div>
          </div>
        </div>

        {/* 統計バッジ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">最新日期</div>
            <div className="text-sm font-medium text-gray-900">{formatDate(interviewee.latest_interview_date)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-red-600 mb-1">P1</div>
            <div className="text-lg font-bold text-red-600">{interviewee.p1_count}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-xs text-yellow-600 mb-1">P2</div>
            <div className="text-lg font-bold text-yellow-600">{interviewee.p2_count}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">P3</div>
            <div className="text-lg font-bold text-blue-600">{interviewee.p3_count}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 mb-1">P4</div>
            <div className="text-lg font-bold text-green-600">{interviewee.p4_count}</div>
          </div>
        </div>
      </div>

      {/* 平均スコア */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">平均各項分数</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">技術力</div>
            <div className="text-3xl font-bold text-blue-600">{interviewee.avg_technical_score.toFixed(1)}</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-sm text-gray-600 mb-2">表現力</div>
            <div className="text-3xl font-bold text-green-600">{interviewee.avg_expression_score.toFixed(1)}</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-sm text-gray-600 mb-2">論理力</div>
            <div className="text-3xl font-bold text-purple-600">{interviewee.avg_logic_score.toFixed(1)}</div>
          </div>
          <div className="text-center border-l border-gray-100">
            <div className="text-sm text-gray-600 mb-2">日本語</div>
            <div className="text-3xl font-bold text-orange-600">{interviewee.avg_japanese_score.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* 最近の採訪 */}
      {interviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の採訪（{interviews.length}件）</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">職位</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">スコア</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">レベル</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">言語</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.map((interview: any) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{interview.job_role}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{interview.score?.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        {interview.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{interview.lang === 'ja' ? '日本語' : '中文'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(interview.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 設計セッション */}
      {designSessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">設計セッション（{designSessions.length}件）</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">面接日</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">部門</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">P-Level</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">スコア</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">完了日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {designSessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(session.interview_date)}</td>
                    <td className="px-4 py-3 text-gray-700">{session.department || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        session.p_level === 'P1' ? 'bg-red-50 text-red-600' :
                        session.p_level === 'P2' ? 'bg-yellow-50 text-yellow-600' :
                        session.p_level === 'P3' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {session.p_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{session.total_score}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(session.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
