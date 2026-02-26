'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2, ArrowRight, Calendar, Mail } from 'lucide-react'

interface SessionDetails {
    plan: string
    customerEmail: string | null
    nextBillingDate: string | null
    status: string
}

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session_id')

    const [details, setDetails] = useState<SessionDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError('No session ID found. Please contact support.')
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false)
            return
        }

        fetch(`/api/stripe/checkout-session?session_id=${sessionId}`)
            .then(async res => {
                if (!res.ok) {
                    const d = await res.json().catch(() => ({}))
                    // Intentionally omit raw server error — must not leak to browser devtools
                    console.error('[success] session fetch failed')
                    throw new Error('session_fetch_failed')
                }
                return res.json() as Promise<SessionDetails>
            })
            .then(d => {
                if (d.status !== 'complete') {
                    setError('Your payment could not be confirmed. Please contact support.')
                    setLoading(false)
                    return
                }
                setDetails(d)
                setLoading(false)
            })
            .catch(err => {
                if (err.name === 'AbortError') return
                // Intentionally generic — raw API errors must not leak to the UI
                console.error('[success] unexpected error:', err)
                setError('Something went wrong confirming your payment. Please contact support.')
                setLoading(false)
            })
    }, [sessionId])

    const planLabel = details?.plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-white/40" role="status" aria-label="Confirming your payment">
                    <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
                    <p className="text-sm">Confirming your payment…</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <p className="text-white/60 text-sm mb-6">{error}</p>
                    <button
                        id="go-back-btn"
                        onClick={() => router.push('/pricing')}
                        className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all cursor-pointer"
                    >
                        Back to Pricing
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center ring-1 ring-emerald-500/30">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-[500] tracking-tight text-white mb-2">
                        Payment successful!
                    </h1>
                    <p className="text-white/40 text-sm mb-8">
                        Welcome to ContentJet Pro. Your account has been upgraded.
                    </p>

                    {/* Details */}
                    <div className="space-y-3 text-left mb-8">
                        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-white/50" />
                            </div>
                            <div>
                                <p className="text-xs text-white/40 leading-none mb-0.5">Plan</p>
                                <p className="text-sm font-medium text-white capitalize">{planLabel}</p>
                            </div>
                        </div>

                        {details?.nextBillingDate && (
                            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 text-white/50" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 leading-none mb-0.5">Next billing date</p>
                                    <p className="text-sm font-medium text-white">{details.nextBillingDate}</p>
                                </div>
                            </div>
                        )}

                        {details?.customerEmail && (
                            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-white/50" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 leading-none mb-0.5">Receipt sent to</p>
                                    <p className="text-sm font-medium text-white truncate">{details.customerEmail}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <Link
                        id="go-to-dashboard-btn"
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-center text-xs text-white/20 mt-6">
                    A confirmation email has been sent by Stripe. Manage your billing from the dashboard.
                </p>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center" role="status" aria-label="Loading">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" aria-hidden="true" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
