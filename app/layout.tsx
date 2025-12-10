import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
      </head>
      <body className={`font-sans h-full overflow-x-hidden`}>
        <div className="min-h-screen bg-gradient-to-br from-pink-300 to-rose-400 dark:from-gray-800 dark:to-indigo-500 bg-[url('/grid.svg')] bg-center">
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
