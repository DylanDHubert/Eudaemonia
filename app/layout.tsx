import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "Eudaemonia - Track Your Well-being",
  description: "Monitor lifestyle factors to improve your well-being",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${GeistSans.className} h-full bg-gradient-to-br from-blue-50 to-indigo-50`}>
        <div className="min-h-screen bg-[url('/grid.svg')] bg-center">
          <Navigation />
          <main className="pt-16">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
