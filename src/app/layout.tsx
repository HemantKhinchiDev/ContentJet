import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "./landing/landing.css";

import { AuthProvider } from "@/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalyticsConditional } from "@/components/GoogleAnalyticsConditional";
import { CookieBanner } from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI SaaS Boilerplate - Launch in Days, Not Months",
  description: "Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-black font-inter`}
      >
        <AuthProvider>
          <ThemeProvider
            defaultTheme="dark"
            storageKey="contentjet-theme"
          >
            {children}
          </ThemeProvider>
          <GoogleAnalyticsConditional />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
