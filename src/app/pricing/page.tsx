'use client'

import { useState } from 'react'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Check, Zap, Star } from 'lucide-react'
import type { Metadata } from 'next'

// Note: Metadata cannot be used in 'use client' — moved to a separate layout if needed.
// For SEO this page can be converted to a RSC wrapper with a client PricingClient child.

const FEATURES = [
    'Unlimited AI-generated content',
    'Blog posts, emails & social media',
    'SEO-optimized output',
    'Content history & search',
    'Priority AI processing',
    'Team collaboration',
    'Custom templates',
    'API access',
]

async function startCheckout(plan: 'monthly' | 'yearly') {
    const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error ?? 'Failed to start checkout')
    }

    if (data.url) {
        window.location.href = data.url
    } else {
        throw new Error('No checkout URL returned. Please try again.')
    }
}

export default function PricingPage() {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
    const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        setError(null)
        setLoading(plan)
        try {
            await startCheckout(plan)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    const monthlyPrice = 29
    const yearlyPrice = 290
    const yearlyPerMonth = (yearlyPrice / 12).toFixed(0)
    const savingPct = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)

    return (
        <main className="relative min-h-screen bg-black">
            <Header />

            <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-[500] tracking-[-0.04em] text-white/95 mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-[18px] text-white/40 max-w-[560px] mx-auto">
                        One plan, all features. Pay monthly or save {savingPct}% with an annual subscription.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-white/40'}`}>
                        Monthly
                    </span>
                    <button
                        id="billing-toggle"
                        role="switch"
                        aria-checked={billing === 'yearly'}
                        onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-12 h-6 rounded-full bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                        aria-label="Toggle billing period"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${billing === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
                    <span className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${billing === 'yearly' ? 'text-white' : 'text-white/40'}`}>
                        Yearly
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Save {savingPct}%
                        </span>
                    </span>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">

                    {/* Monthly card */}
                    <div
                        id="monthly-plan-card"
                        className={`relative rounded-2xl border p-8 flex flex-col transition-all ${billing === 'monthly'
                            ? 'border-white/20 bg-white/5'
                            : 'border-white/8 bg-white/[0.02] opacity-60'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white/60" />
                            </div>
                            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Monthly</span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-1">
                                <span className="text-5xl font-[500] text-white tracking-tight">SGD ${monthlyPrice}</span>
                                <span className="text-white/40 mb-2">/month</span>
                            </div>
                            <p className="text-sm text-white/40 mt-1">Billed monthly. Cancel anytime.</p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                                    <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            id="subscribe-monthly-btn"
                            onClick={() => handleSubscribe('monthly')}
                            disabled={loading !== null}
                            className="w-full py-3 rounded-xl border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            {loading === 'monthly' ? 'Redirecting…' : 'Get started monthly'}
                        </button>
                    </div>

                    {/* Yearly card */}
                    <div
                        id="yearly-plan-card"
                        className={`relative rounded-2xl border p-8 flex flex-col transition-all ${billing === 'yearly'
                            ? 'border-white/30 bg-white/8 ring-1 ring-white/10'
                            : 'border-white/8 bg-white/[0.02] opacity-60'
                            }`}
                    >
                        {/* Save badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-black">
                                Save {savingPct}% · Best value
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                                <Star className="w-4 h-4 text-white/80" fill="currentColor" />
                            </div>
                            <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Yearly</span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-1">
                                <span className="text-5xl font-[500] text-white tracking-tight">SGD ${yearlyPrice}</span>
                                <span className="text-white/40 mb-2">/year</span>
                            </div>
                            <p className="text-sm text-white/40 mt-1">
                                SGD ${yearlyPerMonth}/month · Save SGD ${monthlyPrice * 12 - yearlyPrice} vs monthly
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            id="subscribe-yearly-btn"
                            onClick={() => handleSubscribe('yearly')}
                            disabled={loading !== null}
                            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            {loading === 'yearly' ? 'Redirecting…' : 'Get started yearly'}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-center text-sm text-red-400 mt-6">{error}</p>
                )}

                {/* Trust strip */}
                <p className="text-center text-sm text-white/25 mt-10">
                    Secure payments via Stripe · No hidden fees · Cancel anytime
                </p>
            </div>

            <Footer />
        </main>
    )
}
