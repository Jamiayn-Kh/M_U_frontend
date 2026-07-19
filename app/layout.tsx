import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'Мөнгөн урлал — Загварын захиалгын систем',
  description: 'Мөнгөн эдлэлийн загвар захиалах, хянах дотоод систем',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3b4a6b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className="bg-background">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
