import IntervieweesDashboard from '@/components/admin/IntervieweesDashboard'
import Link from 'next/link'

export default function IntervieweesDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/interviewees" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
          ← 戻る
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">面試者ダッシュボード</h1>
      </div>
      <IntervieweesDashboard />
    </div>
  )
}
