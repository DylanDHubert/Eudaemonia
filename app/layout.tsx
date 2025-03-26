import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Next.js App",
  description: "A Next.js application with authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
