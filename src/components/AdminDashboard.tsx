'use client'
import { useEffect, useRef } from 'react'

type Stats = {
  total_users:      number
  total_interviews: number
  level_dist:       Record<string, number>
  top_roles:        Array<{ role: string; cnt: number }>
  daily_7d:         Array<{ day: string; cnt: number }>
}

type DesignStats = {
  total_sessions: number
  avg_score:      number | null
  p_level_dist:   Record<string, number>
  top_domains:    Array<{ domain: string; cnt: number }>
  daily_7d:       Array<{ day: string; cnt: number }>
}

const LEVEL_COLOR: Record<string, string> = {
  P1: '#FCA5A5', P2: '#FCD34D', P3: '#93C5FD', P4: '#6EE7B7'
}

const P_LEVEL_COLOR: Record<string, string> = {
  P1: '#D1D5DB', P2: '#93C5FD', P3: '#6EE7B7', P4: '#C4B5FD'
}

export default function AdminDashboard({
  stats, designStats, recent, recentDesign
}: {
  stats:        Stats | null
  designStats:  DesignStats | null
  recent:       any[]
  recentDesign: any[]
}) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current || !stats?.daily_7d?.length) return
    let chart: any

    const load = async () => {
      const Chart = (await import('chart.js/auto')).default
      const days = stats.daily_7d ?? []

      chart = new Chart(chartRef.current!, {
        type: 'line',
        data: {
          labels: days.map(d => d.day),
          datasets: [{
            label: '面接数',
            data: days.map(d => d.cnt),
            borderColor: '#2D5BE3',
            backgroundColor: 'rgba(45,91,227,0.08)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#2D5BE3',
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0, color: '#9CA3AF' },
              grid:  { color: 'rgba(0,0,0,0.04)' },
            },
            x: {
              ticks: { color: '#9CA3AF' },
              grid:  { display: false },
            }
          }
        }
      })
    }

    load()
    return () => { chart?.destroy() }
  }, [stats])

  const s = stats
  const levelTotal = s ? Object.values(s.level_dist).reduce((a, b) => a + b, 0) : 1

  return (
    <>
      {/* KPI 2格 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '総ユーザー',  value: s?.total_users      ?? 0 },
          { label: '総面接数',    value: s?.total_interviews  ?? 0 },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-medium text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* 趋势图 + 等级分布 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-4">直近7日の面接数</div>
          {(stats?.daily_7d?.length ?? 0) > 0 ? (
            <div style={{ position: 'relative', height: '140px' }}>
              <canvas ref={chartRef} />
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-xs text-gray-300">
              データが蓄積されると表示されます
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-4">レベル分布</div>
          <div className="space-y-3">
            {['P1','P2','P3','P4'].map(lv => {
              const cnt = s?.level_dist?.[lv] ?? 0
              const pct = levelTotal > 0 ? Math.round((cnt / levelTotal) * 100) : 0
              return (
                <div key={lv} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-6">{lv}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: LEVEL_COLOR[lv] }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{cnt}人 {pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 热门岗位 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-4">人気ポジション TOP5</div>
        {(s?.top_roles?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {s!.top_roles.map((r, i) => (
              <div key={r.role} className="flex items-center gap-3">
                <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-[#2D5BE3] rounded-full"
                    style={{ width: `${(r.cnt / (s!.top_roles[0]?.cnt ?? 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 truncate max-w-28">{r.role}</span>
                <span className="text-xs text-gray-400 w-6 text-right">{r.cnt}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-300 text-center py-4">データなし</p>
        )}
      </div>

      {/* 最近面试记录 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">最近の面接記録</span>
          <span className="text-xs text-gray-400">直近20件</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 && (
            <p className="text-xs text-gray-300 text-center py-6">記録なし</p>
          )}
          {recent.map(item => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="text-sm text-gray-700">{item.job_role}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(item.created_at).toLocaleDateString('ja-JP', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{item.level}</span>
                <span className="text-sm font-medium text-gray-900">{item.score?.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 設計コースセクション ── */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-gray-800 mb-4">設計コース</h2>
      </div>

      {/* 設計 KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: '総受験セッション', value: designStats?.total_sessions ?? 0 },
          { label: '平均スコア',       value: designStats?.avg_score != null ? `${designStats.avg_score}/80` : '-' },
          { label: '最多領域',         value: designStats?.top_domains?.[0]?.domain ?? '-' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-medium text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Pレベル分布 + 人気領域 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-4">Pレベル分布</div>
          <div className="space-y-3">
            {['P1', 'P2', 'P3', 'P4'].map(lv => {
              const cnt = designStats?.p_level_dist?.[lv] ?? 0
              const total = designStats?.total_sessions ?? 1
              const pct = total > 0 ? Math.round((cnt / total) * 100) : 0
              return (
                <div key={lv} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-6">{lv}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: P_LEVEL_COLOR[lv] }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-14 text-right">{cnt}件 {pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-4">人気設計領域 TOP5</div>
          {(designStats?.top_domains?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {designStats!.top_domains.map((d, i) => (
                <div key={d.domain} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-[#2D5BE3] rounded-full"
                      style={{ width: `${(d.cnt / (designStats!.top_domains[0]?.cnt ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 truncate max-w-24">{d.domain}</span>
                  <span className="text-xs text-gray-400 w-6 text-right">{d.cnt}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-300 text-center py-4">データなし</p>
          )}
        </div>
      </div>

      {/* 最近の設計セッション */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">最近の設計セッション</span>
          <span className="text-xs text-gray-400">直近10件</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentDesign.length === 0 && (
            <p className="text-xs text-gray-300 text-center py-6">記録なし</p>
          )}
          {recentDesign.map(item => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="flex gap-1 flex-wrap">
                  {(item.selected_domains as string[] ?? []).slice(0, 2).map((d: string) => (
                    <span key={d} className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">{d}</span>
                  ))}
                  {(item.selected_domains as string[] ?? []).length > 2 && (
                    <span className="text-xs text-gray-400">+{(item.selected_domains as string[]).length - 2}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('ja-JP', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{item.p_level}</span>
                <span className="text-sm font-medium text-gray-900">{item.total_score}<span className="text-xs text-gray-400">/80</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
