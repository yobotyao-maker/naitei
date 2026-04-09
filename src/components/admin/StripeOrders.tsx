'use client'
import { useState } from 'react'

type Order = {
  id: string; email: string | null; plan: string
  amount: number; currency: string; createdAt: string
}

const PLAN_BADGE: Record<string, string> = {
  pack: 'text-blue-600 bg-blue-50',
  pro:  'text-yellow-600 bg-yellow-50',
}

export default function StripeOrders() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded,  setLoaded]  = useState(false)

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/stripe-orders')
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoaded(true)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Stripe 注文明細</span>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-[#2D5BE3] hover:text-blue-700 font-medium disabled:text-gray-400 transition-colors"
        >
          {loading ? '読み込み中...' : loaded ? '更新' : '読み込む'}
        </button>
      </div>

      {!loaded && (
        <p className="text-xs text-gray-300 text-center py-8">「読み込む」をクリックしてください</p>
      )}
      {loaded && orders.length === 0 && (
        <p className="text-xs text-gray-300 text-center py-8">注文なし</p>
      )}

      <div className="divide-y divide-gray-50">
        {orders.map(o => (
          <div key={o.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_BADGE[o.plan] ?? 'bg-gray-50 text-gray-500'}`}>
                  {o.plan === 'pack' ? 'Pack ¥2,940' : o.plan === 'pro' ? 'Pro ¥5,940' : o.plan}
                </span>
              </div>
              <span className="text-xs text-gray-400">{o.email ?? '—'}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ¥{o.amount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(o.createdAt).toLocaleDateString('ja-JP', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
