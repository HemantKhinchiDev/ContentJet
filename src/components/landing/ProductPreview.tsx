'use client'

import Image from 'next/image'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export function ProductPreview() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

    return (
        <section className="container mx-auto px-6 py-20">
            <div
                ref={ref}
                className={`relative mx-auto max-w-6xl transition-all duration-700 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'
                    }`}
            >
                <div className="relative overflow-hidden rounded-2xl border border-landing-border bg-landing-surface p-2 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-landing-surface to-landing-bg">
                        {/* Placeholder for product mockup */}
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <div className="mb-4 text-6xl">🚀</div>
                                <p className="text-landing-text-secondary">Dashboard Preview</p>
                                <p className="mt-2 text-sm text-landing-text-secondary">
                                    Analytics • User Management • API Playground
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 -z-10 blur-3xl">
                    <div className="h-full w-full bg-gradient-to-r from-landing-accent/20 to-purple-500/20"></div>
                </div>
            </div>
        </section>
    )
}
