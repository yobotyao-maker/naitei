import FeedbackSearch from '@/components/admin/FeedbackSearch'

export default function FeedbackPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">フィードバック管理</h1>
      <FeedbackSearch />
    </div>
  )
}
