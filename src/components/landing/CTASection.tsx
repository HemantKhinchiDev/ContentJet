'use client'

import { analytics } from '@/lib/analytics'; // 🆕 GA4

export function CTASection() {
    return (
        <section className="max-w-[1436px] mx-auto px-6 py-28">
            <div className="text-center">
                {/* 🆕 SEO: Optimized Heading */}
                <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[550] leading-[1.1] tracking-[-0.04em] mb-6">
                    <span className="text-white/95">Start Creating Content</span>
                    <br />
                    <span className="text-white/[0.45]">10x Faster with AI</span>
                </h2>

                {/* Subtitle */}
                <p className="text-[18px] text-white/[0.35] mb-10">
                    Join thousands of marketers already using ContentJet to save 10+ hours a week.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                    <a
                        href="/signup"
                        onClick={() => analytics.buttonClicked('start_building_cta', 'cta_section')}
                        className="cursor-pointer px-8 py-3 bg-white text-black text-[14px] font-medium rounded-full hover:bg-white/90 transition-all"
                    >
                        Start building — it&apos;s free
                    </a>
                    <a
                        href="/contact"
                        onClick={() => analytics.buttonClicked('talk_to_sales', 'cta_section')}
                        className="cursor-pointer px-8 py-3 border border-white/[0.15] bg-white/[0.03] text-white/60 hover:text-white/90 hover:bg-white/[0.06] text-[14px] font-medium rounded-full transition-all"
                    >
                        Talk to sales
                    </a>
                </div>
            </div>
        </section>
    )
}
