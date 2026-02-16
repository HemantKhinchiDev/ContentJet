import dynamic from 'next/dynamic'
import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'

// Lazy load below-the-fold components
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="min-h-[600px]" />
})

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="min-h-[500px]" />
})

const CTASection = dynamic(() => import('@/components/landing/CTASection').then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="min-h-[400px]" />
})

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="min-h-[300px]" />
})

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
