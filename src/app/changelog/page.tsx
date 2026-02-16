import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Changelog - ContentJet',
    description: 'See what\'s new in ContentJet. Latest features, improvements, and bug fixes.',
}

export default function ChangelogPage() {
    return (
        <main className="relative min-h-screen bg-black">
            <Header />
            <div className="max-w-[1436px] mx-auto px-6 pt-32 pb-20">
                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-[500] tracking-[-0.04em] text-white/95 mb-6">
                    Changelog
                </h1>
                <p className="text-[18px] text-white/40 max-w-[720px] mb-16">
                    Latest features, improvements, and bug fixes.
                </p>
                {/* Changelog entries will be listed here */}
            </div>
            <Footer />
        </main>
    )
}
