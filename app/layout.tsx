import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { getServerSession } from '@/lib/supabase/auth';
import { Spectral_SC } from 'next/font/google';

// CONFIGURE SPECTRAL SC FONT
const spectralSC = Spectral_SC({ 
  weight: ['200'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-spectral-sc',
});

export const metadata: Metadata = {
  title: "Eudaemonia - Track Your Well-being",
  description: "Monitor lifestyle factors to improve your well-being",
  icons: {
    icon: [
      { url: '/light.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark.png', media: '(prefers-color-scheme: dark)' },
      { url: '/light.png' }, // DEFAULT FALLBACK
    ],
    apple: [
      { url: '/icon.png' }, // PWA ICON FOR APPLE TOUCH ICON
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Eudaemonia',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en" className={`${spectralSC.variable} h-full`}>
      <head>
        {/* ADDITIONAL IOS PWA META TAGS FOR SEARCH BAR HIDING */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* PWA MANIFEST */}
        <link rel="manifest" href="/manifest.json" />
        {/* THEME COLOR FOR PWA STATUS BAR - UPDATED DYNAMICALLY BY ThemeColorUpdater */}
        <meta name="theme-color" content="#FECDD3" />
        {/* APP ICONS - USE LIGHT AS DEFAULT, DARK FOR DARK MODE */}
        <link rel="icon" href="/light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/light.png" />
        {/* PWA ICON - USE icon.png FOR APPLE TOUCH ICON */}
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`font-sans h-full overflow-x-hidden`}>
        <div className="min-h-screen relative">
          {/* GRADIENT BASE BACKGROUND - RED TO ROSE TO PINK (LIGHT), INDIGO/PURPLE (DARK) */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-rose-300 to-pink-300 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-800"></div>
          
          {/* IMAGE OVERLAY AT 10% OPACITY */}
          <div className="absolute inset-0 bg-[url('/light_bg.png')] dark:bg-[url('/dark_bg.png')] bg-cover bg-center bg-fixed opacity-20"></div>
          
          {/* CONTENT LAYER */}
          <div className="relative z-10">
            {/* Only show Navigation if user is authenticated */}
            {session && <div className="h-16"><Navigation user={session.user} /></div>}
            
            <main className="overflow-x-hidden">
              <Providers>{children}</Providers>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
