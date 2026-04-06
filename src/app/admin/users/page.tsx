import UserManager from '@/components/admin/UserManager'

export default function UsersPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">ユーザー管理</h1>
      <UserManager />
    </div>
  )
}
