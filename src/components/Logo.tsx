import Link from 'next/link'
import Image from 'next/image'

/**
 * size='sm'  — 导航栏：小图标 + 文字
 * size='lg'  — 登录页：大图标居中，无附加文字
 */
export default function Logo({ size = 'sm', href = '/' }: { size?: 'sm' | 'lg'; href?: string }) {
  if (size === 'lg') {
    return (
      <Link href={href} className="flex flex-col items-center gap-2">
        <Image src="/logo.svg" alt="interview" width={72} height={72} priority />
      </Link>
    )
  }

  return (
    <Link href={href} className="flex items-center gap-2">
      <Image src="/logo.svg" alt="" width={28} height={28} priority />
      <span className="font-semibold text-gray-900 text-sm">
        interview
      </span>
    </Link>
  )
}
