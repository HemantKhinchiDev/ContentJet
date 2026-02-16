import { Button } from './Button'

const features = [
    'Complete source code',
    'All integrations included',
    'Lifetime updates',
    'Discord community',
    'Documentation',
]

export function PricingSection() {
    return (
        <section className="container mx-auto px-6 py-20">
            <div className="mb-16 text-center">
                <h2 className="text-4xl font-bold text-landing-text lg:text-5xl">
                    Simple, transparent pricing
                </h2>
            </div>
            <div className="mx-auto max-w-md">
                <div className="rounded-2xl border border-landing-border bg-landing-surface p-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                    <div className="mb-6 text-center">
                        <div className="mb-2">
                            <span className="text-2xl text-landing-text-secondary line-through">$199</span>
                        </div>
                        <div className="text-5xl font-bold text-landing-text">$99</div>
                        <p className="mt-2 text-landing-text-secondary">One-time payment. Lifetime updates.</p>
                    </div>
                    <div className="mb-8 space-y-3">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <svg
                                    className="h-5 w-5 flex-shrink-0 text-landing-success"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span className="text-landing-text">{feature}</span>
                            </div>
                        ))}
                    </div>
                    <Button variant="primary" className="w-full">
                        Get Access Now
                    </Button>
                </div>
            </div>
        </section>
    )
}
