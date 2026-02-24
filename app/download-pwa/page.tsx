'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DownloadPWAPage() {
  const [url, setUrl] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(systemDark)
    if (systemDark) {
      document.documentElement.classList.add('dark')
    }
    setUrl(window.location.origin)

    // Check if already running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone || 
                  document.referrer.includes('android-app://')
    
    if (isPWA) {
      setInstalled(true)
      return
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Auto-trigger install prompt
      setTimeout(() => {
        e.prompt()
        e.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            setInstalled(true)
          }
          setDeferredPrompt(null)
        })
      }, 500)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferredPrompt(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary dark:bg-white shadow-xl mb-4">
            {installed ? (
              <CheckCircle className="h-10 w-10 text-white dark:text-black" />
            ) : (
              <Smartphone className="h-10 w-10 text-white dark:text-black" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold dark:text-white">
            {installed ? 'App Installed!' : 'Install LJ Events'}
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            {installed ? 'Check your home screen to launch the app' : 'Get the full app experience on your device'}
          </p>
        </div>

        {!installed && (
          <Card className="shadow-2xl dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 dark:text-white">How to Install</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary dark:bg-white flex items-center justify-center flex-shrink-0 text-white dark:text-black font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">Scan QR Code</p>
                          <p className="text-sm text-muted-foreground">Use your phone camera to scan</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary dark:bg-white flex items-center justify-center flex-shrink-0 text-white dark:text-black font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">Open Link</p>
                          <p className="text-sm text-muted-foreground">Tap to open in your browser</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary dark:bg-white flex items-center justify-center flex-shrink-0 text-white dark:text-black font-bold">
                          3
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">Install App</p>
                          <p className="text-sm text-muted-foreground">Tap "Add to Home Screen"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {deferredPrompt && (
                    <Button onClick={handleInstall} className="w-full h-12 text-base" size="lg">
                      <Download className="h-5 w-5 mr-2" />
                      Install Now
                    </Button>
                  )}
                </div>

                <div className="order-1 md:order-2 flex justify-center">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl">
                    {url && (
                      <div className="p-5 bg-white rounded-xl shadow-xl">
                        <QRCodeSVG
                          value={url}
                          size={240}
                          level="H"
                          includeMargin={false}
                          fgColor="#000000"
                          bgColor="#ffffff"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-neutral-800">
                <Link href="/auth/sign-up">
                  <Button variant="outline" className="w-full h-11">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign Up
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {installed && (
          <Card className="shadow-2xl dark:bg-neutral-900 dark:border-neutral-800">
            <CardContent className="p-10 text-center">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">The app has been added to your home screen</p>
                <Link href="/auth/sign-up">
                  <Button className="w-full h-12 text-base" size="lg">
                    Continue to Sign Up
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Compatible with iOS, Android, and Desktop browsers
        </p>
      </div>
    </div>
  )
}
