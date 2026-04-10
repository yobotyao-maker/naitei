import DesignSessionsSearch from '@/components/admin/DesignSessionsSearch'

export default function DesignSessionsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">設計面接記録</h1>
      <DesignSessionsSearch />
    </div>
  )
}
