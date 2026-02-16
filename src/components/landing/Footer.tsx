'use client'

import { Logo } from './Logo'

export function Footer() {
    const columns = {
        Product: ['Features', 'Integrations', 'Changelog', 'Pricing', 'Security', 'Status'],
        Company: ['About', 'Blog', 'Careers', 'Press', 'Partners', 'Legal'],
        Resources: ['Documentation', 'API Reference', 'Community', 'Support', 'System Status', 'Contact'],
        Connect: ['Twitter', 'GitHub', 'Discord', 'LinkedIn']
    }

    return (
        <footer className="max-w-[1436px] mx-auto px-6 border-t border-white/[0.06] py-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
                {/* Brand Column */}
                <div className="col-span-2 md:col-span-1">
                    {/* Logo */}
                    <div className="mb-4">
                        <Logo />
                    </div>

                    {/* Tagline */}
                    <p className="text-[13px] text-white/[0.25] mb-6 leading-relaxed">
                        Build better products,<br />together.
                    </p>

                    {/* Copyright */}
                    <p className="text-[12px] text-white/[0.15]">
                        © 2024 Contentjet.<br />All rights reserved.
                    </p>
                </div>

                {/* Link Columns */}
                {Object.entries(columns).map(([title, links]) => (
                    <div key={title}>
                        <h3 className="text-[12px] uppercase tracking-[0.12em] text-white/40 font-medium mb-3">
                            {title}
                        </h3>
                        <ul className="space-y-2.5">
                            {links.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="cursor-pointer text-[13px] text-white/[0.25] hover:text-white/60 transition-colors"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </footer>
    )
}
