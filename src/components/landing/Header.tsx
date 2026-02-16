'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X, Sparkles, Shield, Zap, Lock, Code, Activity } from 'lucide-react'
import { Logo } from './Logo'

export function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [featuresOpen, setFeaturesOpen] = useState(false)
    const [companyOpen, setCompanyOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const features = [
        { icon: Activity, title: 'Analytics', desc: 'Track every metric that matters' },
        { icon: Zap, title: 'Integrations', desc: 'Connect with your favorite tools' },
        { icon: Sparkles, title: 'Automation', desc: 'Automate your workflow' },
        { icon: Shield, title: 'Security', desc: 'Enterprise-grade protection' },
        { icon: Code, title: 'API', desc: 'Build custom integrations' },
        { icon: Lock, title: 'Real-time', desc: 'Instant synchronization' },
    ]

    return (
        <>
            {/* Top gradient accent line */}
            <div className="fixed top-0 left-0 right-0 h-px z-50 bg-gradient-to-r from-transparent via-[#5e6ad2]/40 to-transparent" />

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.06]'
                    : 'bg-transparent'
                    }`}
                style={{ paddingTop: '1px' }}
            >
                <div className="max-w-[1436px] mx-auto px-6 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center cursor-pointer">
                        <Logo />
                    </a>

                    {/* Center Nav - Desktop Only */}
                    <nav className="hidden md:flex items-center gap-6">
                        {/* Features Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setFeaturesOpen(true)}
                            onMouseLeave={() => setFeaturesOpen(false)}
                        >
                            <button className="cursor-pointer flex items-center gap-1 text-[13px] text-white/50 hover:text-white/90 transition">
                                Features
                                <ChevronDown size={14} className={`transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {featuresOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[520px]"
                                    >
                                        <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.06] rounded-xl p-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {features.map((feature, idx) => {
                                                    const Icon = feature.icon
                                                    return (
                                                        <a
                                                            key={idx}
                                                            href="#"
                                                            className="cursor-pointer flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition"
                                                        >
                                                            <div className="w-8 h-8 rounded-md border border-white/[0.08] bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                                                                <Icon size={16} className="text-white/60" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[13px] font-medium text-white/90">{feature.title}</div>
                                                                <div className="text-[12px] text-white/40 mt-0.5">{feature.desc}</div>
                                                            </div>
                                                        </a>
                                                    )
                                                })}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-white/[0.06] flex gap-4 text-[12px]">
                                                <a href="/features" className="cursor-pointer text-white/40 hover:text-white/70">View all features</a>
                                                <span className="text-white/20">·</span>
                                                <a href="/docs" className="cursor-pointer text-white/40 hover:text-white/70">Documentation</a>
                                                <span className="text-white/20">·</span>
                                                <a href="/changelog" className="cursor-pointer text-white/40 hover:text-white/70">What's new</a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <a href="/customers" className="cursor-pointer text-[13px] text-white/50 hover:text-white/90 transition">Customers</a>
                        <a href="/changelog" className="cursor-pointer text-[13px] text-white/50 hover:text-white/90 transition">Changelog</a>
                        <a href="/pricing" className="cursor-pointer text-[13px] text-white/50 hover:text-white/90 transition">Pricing</a>

                        {/* Company Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setCompanyOpen(true)}
                            onMouseLeave={() => setCompanyOpen(false)}
                        >
                            <button className="cursor-pointer flex items-center gap-1 text-[13px] text-white/50 hover:text-white/90 transition">
                                Company
                                <ChevronDown size={14} className={`transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {companyOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64"
                                    >
                                        <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.06] rounded-xl p-3">
                                            <div className="grid grid-cols-2 gap-1">
                                                {['About', 'Careers', 'Blog', 'Contact', 'Partners', 'Press'].map((item) => (
                                                    <a
                                                        key={item}
                                                        href={`/${item.toLowerCase()}`}
                                                        className="cursor-pointer px-3 py-2 text-[13px] text-white/60 hover:text-white/90 hover:bg-white/[0.04] rounded-md transition"
                                                    >
                                                        {item}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <a href="/docs" className="cursor-pointer text-[13px] text-white/50 hover:text-white/90 transition">Docs</a>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <a href="/login" className="cursor-pointer hidden sm:block text-[13px] text-white/50 hover:text-white/80 transition">
                            Log in
                        </a>
                        <a
                            href="/signup"
                            className="cursor-pointer rounded-full border border-white/[0.15] bg-white/[0.06] px-4 py-[6px] text-[13px] text-white/80 hover:bg-white/[0.1] transition"
                        >
                            Sign up
                        </a>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white/60 cursor-pointer"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black md:hidden"
                        style={{ paddingTop: '57px' }}
                    >
                        <div className="p-6 space-y-6">
                            {['Features', 'Customers', 'Changelog', 'Pricing', 'Company', 'Docs'].map((item, idx) => (
                                <motion.a
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="cursor-pointer block text-2xl text-white/80"
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
