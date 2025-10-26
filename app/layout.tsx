import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Rizgeo - Global Builder Leaderboard",
  description:
    "Discover and connect with top builders around the world. Track your progress, showcase projects, and climb the leaderboard.",
  generator: 'Next.js',
  keywords: ['leaderboard', 'builders', 'developers', 'projects', 'analytics', 'global'],
  authors: [{ name: 'Rizgeo Team' }],
  openGraph: {
    title: 'Rizgeo - Global Builder Leaderboard',
    description: 'Discover and connect with top builders around the world',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizgeo - Global Builder Leaderboard',
    description: 'Discover and connect with top builders around the world',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
