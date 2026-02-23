import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: 'LJ University Event Management',
  description: 'Comprehensive event management platform with event management, team evaluation, and leaderboards',
  applicationName: 'LJ Events',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LJ Events',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/icon-light.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-light.svg', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme');
              if (theme) {
                document.documentElement.classList.add(theme);
              }
              document.documentElement.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
            })()
          `
        }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LJ Events" />
        <meta name="screen-orientation" content="portrait-primary" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
