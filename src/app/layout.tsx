import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAGE LIVE MONITOR",
  description:
    "A premium black-and-gold YouTube livestream monitoring dashboard for channels currently live.",
  icons: {
    icon: [{ url: "/logo_rage.png", type: "image/png" }],
    apple: [{ url: "/logo_rage.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
