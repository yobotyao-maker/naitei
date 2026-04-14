'use client'
import { useEffect, useState } from 'react'

type Stats = {
  total_interviewees: number
  avg_rating: number
  p_level_distribution: {
    P1: number
    P2: number
    P3: number
    P4: number
  }
  department_distribution: Record<string, number>
  department_ratings: Record<string, { count: number; avg_rating: number }>
  interview_frequency: Array<{ day: string; count: number }>
}

export default function IntervieweesDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/interviewees/dashboard')
        const data = await res.json()
        setStats(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">データを読み込めません</p>
      </div>
    )
  }

  const pTotal = stats.p_level_distribution.P1 + stats.p_level_distribution.P2 + stats.p_level_distribution.P3 + stats.p_level_distribution.P4
  const p1Pct = pTotal ? Math.round((stats.p_level_distribution.P1 / pTotal) * 100) : 0
  const p2Pct = pTotal ? Math.round((stats.p_level_distribution.P2 / pTotal) * 100) : 0
  const p3Pct = pTotal ? Math.round((stats.p_level_distribution.P3 / pTotal) * 100) : 0
  const p4Pct = pTotal ? Math.round((stats.p_level_distribution.P4 / pTotal) * 100) : 0

  const deptEntries = Object.entries(stats.department_ratings || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs text-gray-500 mb-2">面試者总数</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total_interviewees}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs text-gray-500 mb-2">平均評級</div>
          <div className="text-3xl font-bold text-blue-600">{stats.avg_rating.toFixed(1)}</div>
          <div className="text-xs text-gray-400 mt-1">/ 10</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs text-gray-500 mb-2">P3 (最多)</div>
          <div className="text-3xl font-bold text-blue-600">{stats.p_level_distribution.P3}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs text-gray-500 mb-2">P4 (最高)</div>
          <div className="text-3xl font-bold text-green-600">{stats.p_level_distribution.P4}</div>
        </div>
      </div>

      {/* P-Level Distribution */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">P-Level 分布</h3>
        <div className="space-y-3">
          {[
            { level: 'P1', count: stats.p_level_distribution.P1, color: 'bg-red-500', pct: p1Pct },
            { level: 'P2', count: stats.p_level_distribution.P2, color: 'bg-yellow-500', pct: p2Pct },
            { level: 'P3', count: stats.p_level_distribution.P3, color: 'bg-blue-500', pct: p3Pct },
            { level: 'P4', count: stats.p_level_distribution.P4, color: 'bg-green-500', pct: p4Pct },
          ].map(item => (
            <div key={item.level}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.level}</span>
                <span className="text-xs text-gray-500">
                  {item.count} ({item.pct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Distribution */}
      {deptEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">部門別分布（Top 5）</h3>
          <div className="space-y-3">
            {deptEntries.map(([dept, data]) => {
              const maxCount = Math.max(...deptEntries.map(e => e[1].count))
              const widthPct = (data.count / maxCount) * 100
              return (
                <div key={dept}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{dept}</span>
                    <span className="text-xs text-gray-500">
                      {data.count}件 (評級: {data.avg_rating.toFixed(1)})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Interview Frequency */}
      {stats.interview_frequency && stats.interview_frequency.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近 7 日間の採訪数</h3>
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between gap-2" style={{ minHeight: '150px' }}>
              {stats.interview_frequency.map(item => {
                const maxCount = Math.max(...stats.interview_frequency.map(f => f.count))
                const heightPct = (item.count / maxCount) * 100
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${heightPct}px`, minHeight: '20px' }}
                    />
                    <div className="text-xs text-gray-600 text-center">{item.day}</div>
                    <div className="text-xs font-semibold text-gray-900">{item.count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
