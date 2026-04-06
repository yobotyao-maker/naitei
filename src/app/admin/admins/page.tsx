import AdminManager from '@/components/admin/AdminManager'

export default function AdminsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">管理者設定</h1>
      <AdminManager />
    </div>
  )
}
