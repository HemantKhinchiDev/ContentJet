'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentValue = 'all' | 'essential' | null

const STORAGE_KEY = 'cookie-consent'

/**
 * GDPR-compliant cookie consent banner.
 *
 * - Shows on first visit (no localStorage entry)
 * - Hides permanently once user makes a choice
 * - Saves choice to localStorage ('all' | 'essential')
 * - Dispatches a 'cookie-consent' CustomEvent so GA4 can load
 *   immediately after "Accept All" without a page reload
 */
export function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Only show banner if no prior choice recorded
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) setVisible(true)
        } catch {
            // Storage unavailable (private mode, disabled, etc.) — show banner
            setVisible(true)
        }
    }, [])

    const handleAcceptAll = () => {
        try {
            localStorage.setItem(STORAGE_KEY, 'all')
        } catch {
            // Storage unavailable — consent won't persist but UX continues
        }
        setVisible(false)
        // Notify GoogleAnalyticsConditional to load GA4 immediately
        window.dispatchEvent(new CustomEvent('cookie-consent', { detail: 'all' }))
    }

    const handleEssentialOnly = () => {
        try {
            localStorage.setItem(STORAGE_KEY, 'essential')
        } catch {
            // Storage unavailable — consent won't persist but UX continues
        }
        setVisible(false)
        window.dispatchEvent(new CustomEvent('cookie-consent', { detail: 'essential' }))
    }

    if (!visible) return null

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-zinc-950/95 backdrop-blur-sm"
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                {/* Message */}
                <p className="text-sm text-zinc-400 leading-relaxed">
                    🍪 We use essential cookies for authentication and analytics cookies to
                    improve your experience.{' '}
                    <Link
                        href="/privacy"
                        className="underline underline-offset-2 hover:text-zinc-200 transition-colors"
                    >
                        Cookie Policy
                    </Link>
                </p>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-3">
                    <button
                        onClick={handleEssentialOnly}
                        className="rounded-lg border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                    >
                        Essential Only
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                    >
                        Accept All
                    </button>
                    {/* Close (same as Essential Only) */}
                    <button
                        onClick={handleEssentialOnly}
                        aria-label="Close cookie banner"
                        className="ml-1 rounded-md p-1 text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
