'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    Zap,
    ArrowUpRight,
    User,
    Calendar,
    Hash,
} from 'lucide-react'

interface Subscription {
    plan_type: string
    status: string
    current_period_end: string | null
    cancel_at_period_end: boolean
    stripe_customer_id: string | null
}

interface UserInfo {
    id: string
    email: string
    created_at: string
}

const PRO_FEATURES = [
    'Unlimited content generation',
    'Advanced AI models (GPT-4, Claude)',
    'Priority support & fast response',
    'Export in multiple formats',
    'Team collaboration tools',
    'Advanced analytics & insights',
]

const UPGRADE_PREVIEW = [
    { icon: '🚀', title: 'Unlimited', desc: 'No generation limits' },
    { icon: '🤖', title: 'Advanced AI', desc: 'GPT-4 & Claude' },
    { icon: '⚡', title: 'Priority', desc: 'Fastest response time' },
]

export default function SettingsPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [user, setUser] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [portalLoading, setPortalLoading] = useState(false)
    const [portalError, setPortalError] = useState<string | null>(null)

    useEffect(() => {
        const supabase = supabaseBrowser()
        Promise.all([
            supabase.auth.getUser(),
            fetch('/api/subscriptions').then(r => r.ok ? r.json() : null).catch(() => null),
        ]).then(([{ data }, sub]) => {
            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email ?? '',
                    created_at: data.user.created_at,
                })
            }
            setSubscription(sub)
            setLoading(false)
        }).catch(() => {
            // Auth or network failure — exit loading so the page doesn't hang
            setLoading(false)
        })
    }, [])

    const handleManageBilling = useCallback(async () => {
        setPortalError(null)
        setPortalLoading(true)
        try {
            const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Portal unavailable')
            if (data.url) window.location.href = data.url
        } catch (err) {
            setPortalError(err instanceof Error ? err.message : 'Failed to open billing portal')
        } finally {
            setPortalLoading(false)
        }
    }, [])

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
                ))}
            </div>
        )
    }

    const isPro = subscription?.plan_type && subscription.plan_type !== 'free'

    const nextBillingDate = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : null

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : '—'

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account and subscription preferences
                </p>
            </div>

            {/* ── Account info ── */}
            <section className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-base font-semibold text-foreground">Account</h2>

                <div className="grid sm:grid-cols-3 gap-4">
                    <InfoTile icon={<User className="h-4 w-4" />} label="Email" value={user?.email ?? '—'} />
                    <InfoTile icon={<Hash className="h-4 w-4" />} label="User ID" value={user ? user.id.slice(0, 16) + '…' : '—'} mono />
                    <InfoTile icon={<Calendar className="h-4 w-4" />} label="Member since" value={joinDate} />
                </div>
            </section>

            {/* ── Subscription ── */}
            <section className="rounded-xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Subscription</h2>
                    {isPro ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                            <Zap className="h-3 w-3 fill-white" />
                            Pro Member
                        </span>
                    ) : (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                            Free Plan
                        </span>
                    )}
                </div>

                {isPro ? (
                    <div className="space-y-5">
                        {/* Plan details */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Plan</p>
                                <p className="text-xl font-semibold text-foreground capitalize">
                                    {subscription?.plan_type === 'yearly' ? 'Yearly' : 'Monthly'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {subscription?.plan_type === 'yearly' ? 'SGD $290 / year' : 'SGD $29 / month'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Status</p>
                                <p className="text-xl font-semibold text-foreground flex items-center gap-2 capitalize">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {subscription?.status}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">All features unlocked</p>
                            </div>
                        </div>

                        {/* Billing date */}
                        {nextBillingDate && (
                            <div className={`flex items-start gap-3 rounded-lg border p-4 ${subscription?.cancel_at_period_end
                                ? 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400'
                                : 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                                }`}>
                                {subscription?.cancel_at_period_end
                                    ? <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    : <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                                <div>
                                    <p className="text-sm font-medium">
                                        {subscription?.cancel_at_period_end ? 'Subscription Ending' : 'Next Billing Date'}
                                    </p>
                                    <p className="text-base font-semibold mt-0.5">{nextBillingDate}</p>
                                    {subscription?.cancel_at_period_end && (
                                        <p className="text-xs mt-1 opacity-80">
                                            Access continues until this date. Reactivate anytime via the billing portal.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Included in your plan
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {PRO_FEATURES.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manage billing */}
                        {portalError && (
                            <p className="text-sm text-destructive">{portalError}</p>
                        )}
                        <button
                            id="manage-billing-settings-btn"
                            onClick={handleManageBilling}
                            disabled={portalLoading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 px-5 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            <CreditCard className="h-4 w-4" />
                            {portalLoading ? 'Opening portal…' : 'Manage Billing & Subscription'}
                        </button>
                        <p className="text-center text-xs text-muted-foreground">
                            Update payment method, view invoices, change plan, or cancel
                        </p>
                    </div>
                ) : (
                    /* Free plan upgrade CTA */
                    <div className="text-center py-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 mb-5">
                            <Zap className="h-7 w-7 text-violet-500 fill-violet-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Unlock Pro Features</h3>
                        <p className="text-sm text-muted-foreground mb-7 max-w-xs mx-auto">
                            Upgrade and get unlimited access to advanced AI, priority support, and more.
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-7 max-w-sm mx-auto">
                            {UPGRADE_PREVIEW.map(f => (
                                <div key={f.title} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                                    <div className="text-2xl mb-1">{f.icon}</div>
                                    <p className="text-xs font-semibold text-foreground">{f.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                                </div>
                            ))}
                        </div>

                        <Link
                            id="upgrade-settings-btn"
                            href="/pricing"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold py-2.5 px-7 rounded-lg hover:opacity-90 transition-opacity text-sm"
                        >
                            View Pricing Plans
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </section>

            {/* ── Danger zone (Pro only) ── */}
            {isPro && (
                <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
                    <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground">
                        Cancel your subscription or make billing changes through the Stripe portal.
                        {subscription?.cancel_at_period_end && nextBillingDate && (
                            <span className="block mt-1 font-medium text-amber-600 dark:text-amber-400">
                                ⚠️ Scheduled for cancellation on {nextBillingDate}.
                            </span>
                        )}
                    </p>
                    <button
                        id="cancel-subscription-btn"
                        onClick={handleManageBilling}
                        disabled={portalLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-background text-destructive text-sm font-medium py-2 px-4 hover:bg-destructive/10 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                        <CreditCard className="h-4 w-4" />
                        {portalLoading
                            ? 'Opening portal…'
                            : subscription?.cancel_at_period_end
                                ? 'Reactivate or Manage Subscription'
                                : 'Cancel Subscription'}
                    </button>
                </section>
            )}
        </div>
    )
}

/* ── Helper ── */
function InfoTile({
    icon, label, value, mono = false,
}: {
    icon: ReactNode
    label: string
    value: string
    mono?: boolean
}) {
    return (
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-sm text-foreground truncate ${mono ? 'font-mono' : 'font-medium'}`}>
                {value}
            </p>
        </div>
    )
}
