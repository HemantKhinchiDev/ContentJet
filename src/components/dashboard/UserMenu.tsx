'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'
import { Settings, CreditCard, LogOut, ChevronDown, Zap } from 'lucide-react'

interface Subscription {
    plan_type: string
    status: string
    current_period_end: string | null
    cancel_at_period_end: boolean
    stripe_customer_id: string | null
}

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [portalLoading, setPortalLoading] = useState(false)
    const [portalError, setPortalError] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const supabase = supabaseBrowser()
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserEmail(data.user.email ?? '')
                setAvatarUrl(
                    data.user.user_metadata?.avatar_url ||
                    data.user.user_metadata?.picture ||
                    null
                )
            }
        })

        fetch('/api/subscriptions')
            .then(r => r.ok ? r.json() : null)
            .then(d => setSubscription(d))
            .catch(() => { })

        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const isPro = subscription?.plan_type && subscription.plan_type !== 'free'
    const letter = userEmail.charAt(0).toUpperCase() || '?'
    const username = userEmail.split('@')[0] || 'User'

    const planLabel = (() => {
        if (!isPro) return 'Free'
        if (subscription?.plan_type === 'yearly') return 'Pro Yearly'
        if (subscription?.plan_type === 'monthly') return 'Pro Monthly'
        // Defensive fallback for unknown paid plan types (e.g. 'lifetime', 'enterprise')
        return 'Pro'
    })()

    const nextBilling = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString('en-SG', {
            year: 'numeric', month: 'short', day: 'numeric',
        })
        : null

    const handleManageBilling = useCallback(async () => {
        setPortalError(null)
        setPortalLoading(true)
        try {
            const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' })
            if (!res.ok) throw new Error('Portal request failed')
            const data = await res.json()
            if (data.url) {
                setIsOpen(false)  // close only on success, before redirect
                window.location.href = data.url
            } else {
                throw new Error('No portal URL returned')
            }
        } catch (err) {
            // Keep menu open so the error message is visible
            setPortalError(err instanceof Error ? err.message : 'Failed to open portal')
        } finally {
            setPortalLoading(false)
        }
    }, [isOpen])

    const handleSignOut = useCallback(async () => {
        const supabase = supabaseBrowser()
        await supabase.auth.signOut()
        window.location.href = '/login'
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            {/* ── Avatar button ── */}
            <button
                id="user-menu-btn"
                ref={triggerRef}
                onClick={() => setIsOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="User menu"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {letter}
                    </div>
                )}

                <div className="hidden sm:block text-left leading-none">
                    <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{planLabel}</p>
                </div>

                <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* ── Dropdown ── */}
            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover shadow-xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150"
                >
                    {/* Header gradient */}
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 px-4 py-4 text-white">
                        <div className="flex items-center gap-3">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center text-base font-bold ring-2 ring-white/20">
                                    {letter}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{userEmail}</p>
                                <div className="mt-1">
                                    {isPro ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/15 px-2 py-0.5 rounded-full">
                                            <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            {planLabel}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-white/60">Free Plan</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Billing info for Pro */}
                        {isPro && nextBilling && (
                            <p className="mt-3 text-xs text-white/50">
                                {subscription?.cancel_at_period_end
                                    ? `⚠️ Ends ${nextBilling}`
                                    : `Next billing: ${nextBilling}`}
                            </p>
                        )}
                    </div>

                    {/* Menu items */}
                    <div className="px-1.5 py-1.5 space-y-0.5">
                        <Link
                            id="settings-menu-item"
                            href="/dashboard/settings"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors cursor-pointer"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            Settings
                        </Link>

                        {portalError && (
                            <p className="px-3 pb-1 text-xs text-destructive">{portalError}</p>
                        )}

                        {isPro ? (
                            <button
                                id="manage-billing-menu-item"
                                role="menuitem"
                                onClick={handleManageBilling}
                                disabled={portalLoading}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                {portalLoading ? 'Opening portal…' : 'Manage Subscription'}
                            </button>
                        ) : (
                            <Link
                                id="upgrade-menu-item"
                                href="/pricing"
                                role="menuitem"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-violet-600 dark:text-violet-400 hover:from-violet-500/20 hover:to-pink-500/20 transition-colors border border-violet-500/20"
                            >
                                <Zap className="h-4 w-4 fill-violet-500 text-violet-500" />
                                Upgrade to Pro
                            </Link>
                        )}

                        <div className="my-1 border-t border-border" />

                        <button
                            id="sign-out-menu-item"
                            role="menuitem"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
