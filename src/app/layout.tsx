import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'naitei.ai · 内定まで、一緒に。',
  description: 'AIがあなたの面接力を診断。在日IT人向けの面接練習サービス。',
  openGraph: {
    title: 'naitei.ai',
    description: 'AIで内定を掴もう',
    url: 'https://naitei.ai',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
