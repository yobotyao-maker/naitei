import InterviewSearch from '@/components/admin/InterviewSearch'

export default function InterviewsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">面接記録</h1>
      <InterviewSearch />
    </div>
  )
}
