import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentJet - Launch AI SaaS in Days, Not Months',
  description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in. Build better products, launch faster.',
  openGraph: {
    title: 'ContentJet - Launch AI SaaS in Days, Not Months',
    description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.',
    type: 'website',
    url: 'https://contentjet.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContentJet - Launch AI SaaS in Days, Not Months',
    description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.',
  }
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
