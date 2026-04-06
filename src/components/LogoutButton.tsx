'use client'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut()
    router.push('/auth')
  }

  return (
    <button
      onClick={handleLogout}
      className={className ?? 'text-xs text-gray-400 hover:text-gray-600 transition-colors'}
    >
      ログアウト
    </button>
  )
}
