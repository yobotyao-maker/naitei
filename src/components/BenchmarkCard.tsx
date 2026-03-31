'use client'
import { useEffect, useState } from 'react'

type BenchmarkData = {
  available: boolean
  count?: number
  avg_score?: number
  percentile_75?: number
  level_dist?: Record<string, number>
}

const LEVEL_COLORS: Record<string, string> = {
  S1: 'bg-red-200', S2: 'bg-orange-200', S3: 'bg-blue-300', S4: 'bg-yellow-300'
}

export default function BenchmarkCard({ jobRole, userScore }: {
  jobRole: string
  userScore: number
}) {
  const [data, setData] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/benchmark?role=${encodeURIComponent(jobRole)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [jobRole])

  if (loading) return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-1/3" />
    </div>
  )

  if (!data?.available) return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
      <p className="text-sm text-gray-400">📊 このポジションのデータを蓄積中...</p>
      <p className="text-xs text-gray-300 mt-1">もっと多くの人が練習すると比較データが見られます</p>
    </div>
  )

  const diff = (userScore - (data.avg_score ?? 0)).toFixed(1)
  const isAbove = userScore >= (data.avg_score ?? 0)
  const levels = ['S1', 'S2', 'S3', 'S4']
  const total = data.count ?? 1

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="text-xs text-gray-400 mb-4 font-medium">
        {jobRole} · {data.count}人のデータと比較
      </div>

      {/* 分数对比 */}
      <div className="flex items-end gap-6 mb-5">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">あなた</div>
          <div className="text-3xl font-medium text-gray-900">{userScore.toFixed(1)}</div>
        </div>
        <div className={`text-sm font-medium mb-1 ${isAbove ? 'text-teal-500' : 'text-orange-400'}`}>
          {isAbove ? `▲ +${diff}` : `▼ ${diff}`}
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">平均</div>
          <div className="text-3xl font-medium text-gray-400">{data.avg_score}</div>
        </div>
        {data.percentile_75 && (
          <div>
            <div className="text-xs text-gray-400 mb-0.5">上位25%</div>
            <div className="text-3xl font-medium text-gray-400">{data.percentile_75.toFixed(1)}</div>
          </div>
        )}
      </div>

      {/* 等级分布 */}
      <div>
        <div className="text-xs text-gray-400 mb-2">レベル分布</div>
        <div className="flex gap-1 h-6">
          {levels.map(lv => {
            const cnt = data.level_dist?.[lv] ?? 0
            const pct = total > 0 ? (cnt / total) * 100 : 0
            return pct > 0 ? (
              <div
                key={lv}
                className={`${LEVEL_COLORS[lv]} rounded flex items-center justify-center`}
                style={{ width: `${pct}%` }}
                title={`${lv}: ${cnt}人`}
              >
                {pct > 12 && <span className="text-xs font-medium text-white">{lv}</span>}
              </div>
            ) : null
          })}
        </div>
        <div className="flex gap-3 mt-2">
          {levels.map(lv => {
            const cnt = data.level_dist?.[lv] ?? 0
            if (!cnt) return null
            return (
              <span key={lv} className="text-xs text-gray-400">
                {lv} {Math.round((cnt / total) * 100)}%
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
