import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
    return (
        <main className="relative min-h-screen">
            <Header />
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
            <Footer />
        </main>
    )
}
