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

const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="min-h-[400px]" />
})

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="min-h-[300px]" />
})

export default function Home() {
  // 🆕 SEO: Structured Data for Google Rich Snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://contentjet.vercel.app/#website",
        "url": "https://contentjet.vercel.app",
        "name": "ContentJet",
        "description": "AI-powered content generation platform",
        "publisher": {
          "@id": "https://contentjet.vercel.app/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://contentjet.vercel.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://contentjet.vercel.app/#organization",
        "name": "ContentJet",
        "url": "https://contentjet.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://contentjet.vercel.app/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/contentjet",
          "https://www.linkedin.com/company/contentjet",
          "https://github.com/contentjet"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "ContentJet",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "29",
          "priceCurrency": "USD",
          "offerCount": "2"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        },
        "description": "AI-powered content generation platform for creating blog posts, social media content, emails, and advertisements in seconds",
        "screenshot": "https://contentjet.vercel.app/screenshot.jpg",
        "softwareVersion": "1.0",
        "author": {
          "@type": "Organization",
          "name": "ContentJet"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://contentjet.vercel.app/#webpage",
        "url": "https://contentjet.vercel.app",
        "name": "ContentJet - AI Content Generator",
        "isPartOf": {
          "@id": "https://contentjet.vercel.app/#website"
        },
        "about": {
          "@id": "https://contentjet.vercel.app/#organization"
        },
        "description": "Generate high-quality blog posts, social media content, emails, and ads in seconds with AI. Save 10+ hours per week."
      }
    ]
  }

  return (
    <main className="relative min-h-screen bg-black">
      {/* 🆕 SEO: Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </main>
  )
}
