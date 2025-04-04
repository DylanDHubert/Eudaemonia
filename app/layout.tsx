import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const session = await getServerSession(authOptions);
  const isAuthPage = (path: string) => path.startsWith('/login') || path.startsWith('/signup');
  
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className={`font-sans h-full`}>
        <div className="min-h-screen bg-gradient-to-br from-pink-300 to-rose-400 bg-[url('/grid.svg')] bg-center">
          {/* Only show Navigation if not on auth pages and user is authenticated */}
          {session && <Navigation user={session.user} />}
          
          <main className={session ? "pt-16" : ""}>
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
