'use client'

export function CTASection() {
    return (
        <section className="max-w-[1436px] mx-auto px-6 py-28">
            <div className="text-center">
                {/* Heading with Gradient */}
                <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-[550] leading-[1.1] tracking-[-0.04em] mb-6">
                    <span className="text-white/95">Build better products</span>
                    <br />
                    <span className="text-white/[0.45]">start today</span>
                </h2>

                {/* Subtitle */}
                <p className="text-[18px] text-white/[0.35] mb-10">
                    Join thousands of teams already using Contentjet to ship faster.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                    <a href="/signup" className="cursor-pointer px-8 py-3 bg-white text-black text-[14px] font-medium rounded-full hover:bg-white/90 transition-all">
                        Start building — it's free
                    </a>
                    <a href="/contact" className="cursor-pointer px-8 py-3 border border-white/[0.15] bg-white/[0.03] text-white/60 hover:text-white/90 hover:bg-white/[0.06] text-[14px] font-medium rounded-full transition-all">
                        Talk to sales
                    </a>
                </div>
            </div>
        </section>
    )
}
