/**
 * Google Analytics 4 analytics helper for ContentJet.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics'
 *   analytics.signup('email')
 *
 * All functions are SSR-safe — they check for `window` before firing.
 * GA4 only receives events after the user accepts cookie consent.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type SignupMethod = 'email' | 'google' | 'github'

interface ContentGeneratedParams {
    /** Template key, e.g. 'BLOG_POST', 'SOCIAL_POST' */
    template: string
    /** Total tokens consumed (prompt + completion) */
    tokens: number
    /** Generation wall-clock time in milliseconds */
    durationMs: number
}

type SubscriptionPeriod = 'monthly' | 'yearly'
type SubscriptionPlan = 'starter' | 'pro' | string

// ─── Raw event fire ───────────────────────────────────────────────────────────

/**
 * Fire a raw GA4 event.
 * Use this for one-off events not covered by the typed helpers below.
 *
 * @example trackEvent('video_play', { video_id: '123' })
 */
export function trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>
): void {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', eventName, params)
}

// ─── Typed analytics helpers ──────────────────────────────────────────────────

export const analytics = {
    /**
     * Track a new user sign-up.
     * Call after a successful signUp() or OAuth redirect.
     *
     * @example analytics.signup('email')
     * @example analytics.signup('google')
     */
    signup(method: SignupMethod): void {
        trackEvent('sign_up', { method })
    },

    /**
     * Track a returning user login.
     * Call after a successful signInWithPassword() or OAuth completion.
     *
     * @example analytics.login('email')
     */
    login(method: string): void {
        trackEvent('login', { method })
    },

    /**
     * Track user logout.
     * Call after supabase.auth.signOut() completes.
     */
    logout(): void {
        trackEvent('logout')
    },

    /**
     * Track a successful AI content generation.
     * Call after the API returns generated content.
     *
     * @example
     * analytics.contentGenerated({
     *   template: 'BLOG_POST',
     *   tokens: 1200,
     *   durationMs: 3500,
     * })
     */
    contentGenerated(params: ContentGeneratedParams): void {
        trackEvent('generate_content', {
            content_template: params.template,
            tokens_used: params.tokens,
            duration_ms: params.durationMs,
        })
    },

    /**
     * Track when a user initiates a subscription checkout.
     * Call when the user clicks a "Subscribe" or "Get Pro" button.
     *
     * @example analytics.subscriptionStarted('pro')
     */
    subscriptionStarted(plan: SubscriptionPlan): void {
        trackEvent('begin_checkout', { plan })
    },

    /**
     * Track a completed subscription purchase (post-Stripe redirect).
     * Call on the /success page after Stripe confirmation.
     *
     * @example analytics.subscriptionCompleted('pro', 29, 'monthly')
     */
    subscriptionCompleted(
        plan: SubscriptionPlan,
        price: number,
        period: SubscriptionPeriod
    ): void {
        trackEvent('purchase', {
            plan,
            value: price,
            currency: 'USD',
            period,
        })
    },

    /**
     * Track usage of a specific dashboard feature.
     *
     * @example analytics.featureUsed('history_view')
     * @example analytics.featureUsed('api_key_settings')
     */
    featureUsed(feature: string): void {
        trackEvent('feature_used', { feature })
    },

    /**
     * Track a button or CTA click.
     *
     * @param label     Machine-readable label for the button, e.g. 'hero_cta'
     * @param location  Where on the page it lives, e.g. 'hero_section'
     *
     * @example analytics.buttonClicked('hero_cta', 'hero_section')
     * @example analytics.buttonClicked('generate_content', 'generator_page')
     */
    buttonClicked(label: string, location: string): void {
        trackEvent('button_clicked', { label, location })
    },

    /**
     * Manually fire a page view (automatic page views are handled by GA4 itself).
     * Only needed for custom SPA navigation that GA4 misses.
     *
     * @example analytics.pageView('/dashboard/generate', 'AI Generator')
     */
    pageView(url: string, title?: string): void {
        trackEvent('page_view', {
            page_location: url,
            ...(title ? { page_title: title } : {}),
        })
    },
}

// ─── Global gtag type declaration ─────────────────────────────────────────────
// Only declare gtag — @next/third-parties already owns dataLayer globally.
// Using optional (?:) prevents 'identical modifiers' conflicts with the
// package's own Window augmentation.

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config' | 'set' | 'js',
            targetId: string,
            config?: Record<string, string | number | boolean>
        ) => void
    }
}
