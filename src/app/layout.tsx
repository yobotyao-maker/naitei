import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'interview · 内定まで、一緒に。',
  description: 'AIがあなたのIT面接力を診断。在日華人エンジニア・PM向けの面接練習サービス。無料で今すぐ試せます。',
  keywords: ['面接練習', 'AI面接', '在日IT', '転職', 'エンジニア面接', '内定'],
  authors: [{ name: 'interview' }],
  openGraph: {
    title: 'interview · 内定まで、一緒に。',
    description: 'AIがあなたのIT面接力を診断。在日華人向け面接練習。',
    url: 'https://interview-ai.vercel.app',
    siteName: 'interview',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'interview',
    description: 'AIで内定を掴もう。在日IT人向け面接練習サービス。',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
