import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pricing - ContentJet',
    description: 'Simple, transparent pricing for teams of all sizes. Start building for free.',
}

export default function PricingPage() {
    return (
        <main className="relative min-h-screen bg-black">
            <Header />
            <div className="max-w-[1436px] mx-auto px-6 pt-32 pb-20">
                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-[500] tracking-[-0.04em] text-white/95 mb-6">
                    Pricing
                </h1>
                <p className="text-[18px] text-white/40 max-w-[720px] mb-16">
                    Start building for free. Upgrade as you grow.
                </p>
                {/* Pricing content will be added here */}
            </div>
            <Footer />
        </main>
    )
}
