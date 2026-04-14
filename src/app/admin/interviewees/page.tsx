import IntervieweeManager from '@/components/admin/IntervieweeManager'

export default function IntervieweesPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">面試者管理</h1>
      <IntervieweeManager />
    </div>
  )
}
