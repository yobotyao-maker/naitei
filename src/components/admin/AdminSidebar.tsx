'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Image from 'next/image'

const NAV = [
  { href: '/admin',                 label: 'ダッシュボード',  disabled: false },
  { href: '/admin/users',           label: 'ユーザー管理',    disabled: false },
  { href: '/admin/interviews',      label: '面接記録',        disabled: false },
  { href: '/admin/design-sessions', label: '設計セッション',  disabled: false },
  { href: '/admin/feedback',        label: 'フィードバック',  disabled: false },
  { href: '/admin/questions',        label: '問題管理',        disabled: false },
  { href: '/admin/admins',          label: '管理者設定',      disabled: false },
]

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2">
        <Image src="/logo.svg" alt="" width={28} height={28} />
        <span className="text-sm font-semibold text-gray-900 tracking-tight">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(n => {
          if (n.disabled) {
            return (
              <span
                key={n.href}
                className="block px-3 py-2 rounded-xl text-sm text-gray-400 cursor-not-allowed opacity-50"
              >
                {n.label}
              </span>
            )
          }
          const active = n.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-blue-50 text-[#2D5BE3] font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {n.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 truncate mb-2">{adminEmail}</div>
        <LogoutButton className="text-xs text-gray-400 hover:text-gray-600 transition-colors" />
      </div>
    </aside>
  )
}
