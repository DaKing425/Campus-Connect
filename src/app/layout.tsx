import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/common/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampusConnect - UW Student Events & Activities',
  description: 'Discover and connect with student events, clubs, and activities at the University of Washington.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
