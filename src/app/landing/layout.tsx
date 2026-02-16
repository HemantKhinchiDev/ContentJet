import type { Metadata } from 'next'
import { inter } from './fonts'
import './landing.css'

export const metadata: Metadata = {
    title: 'AI SaaS Boilerplate - Launch in Days, Not Months',
    description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in. Ship your AI SaaS faster.',
    keywords: ['Next.js', 'AI', 'SaaS', 'Boilerplate', 'Stripe', 'OpenAI', 'TypeScript'],
    authors: [{ name: 'AI SaaS Boilerplate' }],
    openGraph: {
        title: 'AI SaaS Boilerplate - Launch in Days, Not Months',
        description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI SaaS Boilerplate - Launch in Days, Not Months',
        description: 'Production-ready Next.js boilerplate with Auth, Stripe, AI and SEO built-in.',
    },
}

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-landing-bg font-sans antialiased">
                {children}
            </body>
        </html>
    )
}
