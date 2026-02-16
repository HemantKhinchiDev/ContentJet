import { Button } from './Button'

export function FinalCTA() {
    return (
        <section className="relative overflow-hidden py-32">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-landing-bg via-landing-accent/10 to-landing-bg"></div>

            <div className="container relative mx-auto px-6 text-center">
                <h2 className="mb-4 text-5xl font-bold text-landing-text lg:text-6xl">
                    Ready to ship your AI SaaS?
                </h2>
                <p className="mb-8 text-xl text-landing-text-secondary">
                    Join 500+ developers building faster
                </p>
                <Button variant="primary" className="text-lg">
                    Start Building Today
                </Button>
            </div>
        </section>
    )
}
