import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    <html lang="en" className="h-full">
      <body className={`${GeistSans.className} h-full`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 bg-[url('/grid.svg')] bg-center">
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
