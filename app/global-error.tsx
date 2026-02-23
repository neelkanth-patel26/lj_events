'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Critical Error</h1>
              <p className="text-gray-600">
                A critical error occurred. Please refresh the page.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="default" size="lg">
                Refresh Page
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
