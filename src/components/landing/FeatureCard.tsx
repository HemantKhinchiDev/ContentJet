'use client'

import { ReactNode } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

    return (
        <div
            ref={ref}
            className={`group rounded-lg border border-landing-border bg-landing-surface p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0'
                }`}
        >
            <div className="mb-4 text-4xl">{icon}</div>
            <h3 className="mb-2 text-xl font-semibold text-landing-text">{title}</h3>
            <p className="text-landing-text-secondary">{description}</p>
        </div>
    )
}
