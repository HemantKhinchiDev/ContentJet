'use client'

import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { analytics } from '@/lib/analytics'; // 🆕 GA4

const DashboardMockup = dynamic(() => import('./DashboardMockup').then(mod => mod.DashboardMockup), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-xl border border-white/[0.08] bg-[#111113] min-h-[680px] animate-pulse flex items-center justify-center">
            <span className="text-white/20 text-sm">Loading Preview...</span>
        </div>
    )
})

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col justify-center bg-black overflow-hidden pt-32">
            {/* Radial Gradient Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 150% 55% at 50% 100%, #9ea2a8 0%, #8b8f95 8%, #7d8188 15%, #62656a 25%, #494c50 35%, #343739 45%, #242628 55%, #18191b 65%, #0f1011 75%, #08090a 85%)'
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 max-w-[1436px] mx-auto px-6 w-full">
                {/* Announcement Pill */}
                <div className="flex justify-center mb-8">
                    <a
                        href="#"
                        onClick={() => analytics.buttonClicked('announcement_pill', 'hero_section')}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition group"
                    >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#5e6ad2]/20 text-[#818cf8] text-[11px] font-medium uppercase tracking-wide">
                            New
                        </span>
                        <span className="text-[13px] text-white/45">AI SEO, On Autopilot</span>
                        <ChevronRight size={14} className="text-white/30 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                {/* Heading */}
                <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-[550] leading-[1.05] tracking-[-0.04em] text-left max-w-[820px]">
                    <span className="text-white">Launch AI SaaS</span>
                    <br />
                    <span className="text-white">in Days, </span>
                    <span className="text-white/[0.45]">Not Months</span>
                </h1>

                {/* Subtitle */}
                <p className="text-[16px] text-white/[0.35] font-light max-w-[520px] mt-6 leading-relaxed">
                    Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.
                </p>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative z-10 max-w-[1320px] mx-auto w-full px-6 mt-16">
                <DashboardMockup />

                {/* 112px spacer to show shadow against radial gradient */}
                <div className="h-28" />
            </div>
        </section>
    )
}
