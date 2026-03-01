'use client'

import { useState, useEffect } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''
const STORAGE_KEY = 'cookie-consent'

/**
 * Conditionally renders the GA4 script only after the user has accepted
 * "all" cookies via the CookieBanner.
 *
 * - On mount: checks localStorage for saved consent
 * - Listens for the 'cookie-consent' CustomEvent fired by CookieBanner
 *   so GA4 loads immediately on accept (no page reload needed)
 * - Uses a single useEffect with [] so it never double-loads on hot reload
 */
export function GoogleAnalyticsConditional() {
    const [hasConsent, setHasConsent] = useState(false)

    useEffect(() => {
        // Check existing consent on mount
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'all') setHasConsent(true)

        // Listen for real-time consent updates from the CookieBanner
        const handleConsentEvent = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail
            setHasConsent(detail === 'all')
        }

        window.addEventListener('cookie-consent', handleConsentEvent)
        return () => window.removeEventListener('cookie-consent', handleConsentEvent)
    }, [])

    if (!hasConsent || !GA_ID) return null

    return <GoogleAnalytics gaId={GA_ID} />
}
