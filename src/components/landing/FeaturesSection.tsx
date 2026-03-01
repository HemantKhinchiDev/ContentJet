'use client'

import { Zap, GitBranch, BarChart3, Shield, Users, RefreshCw } from 'lucide-react'

export function FeaturesSection() {
    const features = [
        {
            icon: Zap,
            accentColor: '#5e6ad2',
            title: 'Blazing Fast',
            description: 'Built on modern infrastructure with edge computing for sub-100ms response times globally.'
        },
        {
            icon: GitBranch,
            accentColor: '#34d399',
            title: 'Git-native Workflow',
            description: 'Seamlessly integrates with your existing Git workflow. Branch, commit, and deploy with ease.'
        },
        {
            icon: BarChart3,
            accentColor: '#fbbf24',
            title: 'Advanced Analytics',
            description: 'Deep insights into team velocity, cycle times, and project health with real-time dashboards.'
        },
        {
            icon: Shield,
            accentColor: '#f43f5e',
            title: 'Enterprise Security',
            description: 'SOC 2 compliant with SSO, SCIM, audit logs, and fine-grained access controls built-in.'
        },
        {
            icon: Users,
            accentColor: '#a78bfa',
            title: 'Multi-team Collaboration',
            description: 'Purpose-built for organizations with multiple teams working across shared codebases.'
        },
        {
            icon: RefreshCw,
            accentColor: '#22d3ee',
            title: 'Real-time Sync',
            description: 'Every change syncs instantly across all connected clients with conflict-free resolution.'
        },
    ]

    return (
        <section className="max-w-[1436px] mx-auto px-6 py-28">
            {/* 🆕 SEO: Optimized Section Label */}
            <div className="text-[13px] text-[#5e6ad2] uppercase tracking-[0.15em] font-medium mb-4">
                Why Choose ContentJet AI Content Generator?
            </div>

            {/* 🆕 SEO: Optimized Heading */}
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-[500] tracking-[-0.04em] text-white/95 mb-4 max-w-2xl">
                Powerful AI Writing Tools<br />for Every Content Need
            </h2>

            {/* Subtitle */}
            <p className="text-[16px] text-white/[0.30] mb-12 max-w-xl">
                Every feature is built to help you create content faster and ship better campaigns.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((feature, idx) => {
                    const Icon = feature.icon
                    return (
                        <div
                            key={idx}
                            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                        >
                            {/* Top Accent Line */}
                            <div
                                className="h-px w-12 mb-5"
                                style={{
                                    background: `linear-gradient(to right, ${feature.accentColor}, transparent)`
                                }}
                            />

                            {/* Icon */}
                            <Icon size={24} className="text-white/60 mb-4" strokeWidth={1.5} />

                            {/* Title */}
                            <h3 className="text-[15px] font-medium text-white/90 mb-2">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[13.5px] text-white/[0.30] leading-[1.7]">
                                {feature.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
