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
  // Basic SEO
  title: {
    default: 'ContentJet - AI Content Generator | Create Blogs, Ads & Social Posts in Seconds',
    template: '%s | ContentJet - AI Content Generator'
  },

  description: 'Generate high-quality blog posts, social media content, emails, and ads in seconds with ContentJet AI. Save 10+ hours per week. Trusted by 10,000+ marketers and content creators.',

  keywords: [
    'AI content generator',
    'blog post generator',
    'AI writing assistant',
    'content creation tool',
    'social media content creator',
    'AI copywriting',
    'automated content writing',
    'blog writing AI',
    'marketing content generator'
  ],

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contentjet.vercel.app',
    siteName: 'ContentJet',
    title: 'ContentJet - AI Content Generator | Create Content 10x Faster',
    description: 'Professional AI-powered content generation platform. Create blog posts, social media content, emails, and ads in seconds. Join 10,000+ content creators.',
    images: [
      {
        url: 'https://contentjet.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ContentJet AI Content Generator Dashboard',
        type: 'image/jpeg',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@contentjet',
    creator: '@contentjet',
    title: 'ContentJet - AI Content Generator',
    description: 'Create high-quality blog posts, social media content, and ads 10x faster with AI',
    images: ['https://contentjet.vercel.app/twitter-card.jpg'],
  },

  // Canonical URL
  alternates: {
    canonical: 'https://contentjet.vercel.app',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (placeholder)
  verification: {
    google: 'google-site-verification-code-here',
    yandex: 'yandex-verification-code-here',
    // other: { 'bing': 'bing-verification-code-here' } // NextJS removed direct bing support, can put in other if needed
  },

  // App-specific
  applicationName: 'ContentJet',
  category: 'Business Software',

  // Author
  authors: [{ name: 'ContentJet Team' }],

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
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
