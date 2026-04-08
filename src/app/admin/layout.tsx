import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  if (!await isAdmin(supabase, user.id)) redirect('/auth')

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <AdminSidebar adminEmail={user.email!} />
      <main className="flex-1 min-w-0 px-8 py-8">
        {children}
      </main>
    </div>
  )
}
