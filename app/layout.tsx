import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { getServerSession } from '@/lib/supabase/auth';
import { Poppins } from 'next/font/google';

// Configure Poppins font
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
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
    <html lang="en" className={`${poppins.variable} h-full`}>
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
        <div className="min-h-screen bg-[url('/light_bg.png')] dark:bg-[url('/dark_bg.png')] bg-cover bg-center bg-fixed">
          {/* Only show Navigation if user is authenticated */}
          {session && <div className="h-16"><Navigation user={session.user} /></div>}
          
          <main className="overflow-x-hidden">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
