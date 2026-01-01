import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { getServerSession } from '@/lib/supabase/auth';

export const metadata: Metadata = {
  title: "Eudaemonia - Track Your Well-being",
  description: "Monitor lifestyle factors to improve your well-being",
  icons: {
    icon: [
      { url: '/light.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark.png', media: '(prefers-color-scheme: dark)' },
      { url: '/dark.png' }, // DEFAULT FALLBACK - DARK MODE
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
    <html lang="en" className="h-full">
      <head>
        {/* SET DARK MODE IMMEDIATELY TO PREVENT FLASH - DEFAULT TO DARK IF NO PREFERENCE */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedPreference = localStorage.getItem('darkMode');
                const isDarkMode = storedPreference === null ? true : storedPreference === 'true';
                if (isDarkMode) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* PRELOAD CUSTOM FONT */}
        <link rel="preload" href="/font.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {/* ADDITIONAL IOS PWA META TAGS FOR SEARCH BAR HIDING */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* PWA MANIFEST */}
        <link rel="manifest" href="/manifest.json" />
        {/* THEME COLOR FOR PWA STATUS BAR - ROSE FOR LIGHT, PURPLE 950 FOR DARK, UPDATED BY ThemeColorUpdater - DEFAULT TO DARK */}
        <meta name="theme-color" content="#3b0764" />
        {/* APP ICONS - USE DARK AS DEFAULT, LIGHT FOR LIGHT MODE */}
        <link rel="icon" href="/light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/dark.png" />
        {/* PWA ICON - USE icon.png FOR APPLE TOUCH ICON */}
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="font-sans h-full overflow-x-hidden">
        <div className="min-h-screen relative">
          {/* GRADIENT BASE BACKGROUND - RED TO ROSE TO PINK (LIGHT), INDIGO/PURPLE (DARK) */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-rose-300 to-pink-300 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-800"></div>
          
          {/* TEXTURE OVERLAY - ANIMATED OPACITY BETWEEN 10% AND 30% - TILED 300X300 */}
          <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat bg-[length:300px_300px] texture-animate"></div>
          
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
