import type React from "react"
import Link from "next/link"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Food Scanner
            </Link>
            <div className="flex gap-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Scan
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}

