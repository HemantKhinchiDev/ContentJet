'use client'

import { LayoutDashboard, FileText, Sparkles, BarChart3, CreditCard, Settings, CheckCircle2, FileEdit, Clock, Search, Filter } from 'lucide-react'

export function DashboardPreview() {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: FileText, label: 'Content', active: false },
        { icon: Sparkles, label: 'AI Writer', active: false },
        { icon: BarChart3, label: 'Analytics', active: false },
        { icon: CreditCard, label: 'Billing', active: false },
        { icon: Settings, label: 'Settings', active: false },
    ]

    const contentRows = [
        { status: 'published', icon: CheckCircle2, iconColor: '#27C840', title: 'How to Build SaaS with Next.js', category: 'Blog', categoryBg: 'rgba(94,106,210,0.12)', categoryColor: '#A5ACE1', metrics: '2.4k views', avatar: 'JD' },
        { status: 'draft', icon: FileEdit, iconColor: '#6E7079', title: 'AI Content Strategy Guide', category: 'Guide', categoryBg: 'rgba(59,130,246,0.12)', categoryColor: '#93B8F5', metrics: '—', avatar: 'AM' },
        { status: 'published', icon: CheckCircle2, iconColor: '#27C840', title: 'Stripe Integration Tutorial', category: 'Blog', categoryBg: 'rgba(94,106,210,0.12)', categoryColor: '#A5ACE1', metrics: '1.8k views', avatar: 'SK' },
        { status: 'review', icon: Clock, iconColor: '#FEBC2E', title: 'SEO Optimization Checklist', category: 'Doc', categoryBg: 'rgba(139,92,246,0.12)', categoryColor: '#B8A3F5', metrics: '—', avatar: 'LC' },
        { status: 'published', icon: CheckCircle2, iconColor: '#27C840', title: 'Authentication Best Practices', category: 'Blog', categoryBg: 'rgba(94,106,210,0.12)', categoryColor: '#A5ACE1', metrics: '3.1k views', avatar: 'RT' },
        { status: 'draft', icon: FileEdit, iconColor: '#6E7079', title: 'Deploying to Vercel Guide', category: 'Guide', categoryBg: 'rgba(59,130,246,0.12)', categoryColor: '#93B8F5', metrics: '—', avatar: 'MK' },
        { status: 'review', icon: Clock, iconColor: '#FEBC2E', title: 'API Rate Limiting Strategies', category: 'Doc', categoryBg: 'rgba(139,92,246,0.12)', categoryColor: '#B8A3F5', metrics: '—', avatar: 'NP' },
    ]

    return (
        <div className="relative w-[100%] md:w-[95%] lg:w-[90%] max-w-[1400px] mx-auto mt-24 perspective-2000">
            {/* Dashboard Window */}
            <div
                className="relative rounded-[20px] border border-white/[0.08] overflow-hidden transition-transform duration-300 lg:hover:scale-[1.01]"
                style={{
                    background: 'linear-gradient(135deg, #16171D 0%, #0D0E12 100%)',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 100px rgba(94,106,210,0.15)',
                    transform: 'rotateX(3deg)',
                    transformOrigin: 'center top'
                }}
            >
                {/* Window Top Bar - macOS Style */}
                <div
                    className="h-[52px] px-5 flex items-center gap-2 border-b border-white/[0.06]"
                    style={{
                        background: 'linear-gradient(180deg, #1E1F26 0%, #18191E 100%)'
                    }}
                >
                    {/* Traffic Light Dots */}
                    <div
                        className="w-3 h-3 rounded-full bg-[#FF5F57]"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    />
                    <div
                        className="w-3 h-3 rounded-full bg-[#FEBC2E]"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    />
                    <div
                        className="w-3 h-3 rounded-full bg-[#28C840]"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    />
                </div>

                {/* Window Body */}
                <div className="flex min-h-[600px] md:min-h-[600px] sm:min-h-[400px] bg-[#0D0E12]">
                    {/* Sidebar - Hidden on Mobile */}
                    <aside
                        className="hidden md:flex w-[220px] lg:w-[260px] flex-col gap-1 p-5 border-r border-white/[0.06]"
                        style={{
                            background: 'linear-gradient(180deg, #0F1014 0%, #0A0B0F 100%)'
                        }}
                    >
                        {navItems.map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={idx}
                                    className={`h-9 px-3 flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ${item.active
                                            ? 'bg-[rgba(94,106,210,0.12)] text-[#C9CEEB] border-l-2 border-[#5E6AD2] pl-[10px]'
                                            : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <Icon size={18} strokeWidth={2} />
                                    <span>{item.label}</span>
                                </button>
                            )
                        })}
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 bg-[#0D0E12] p-8 overflow-y-auto">
                        {/* Top Bar */}
                        <div className="h-14 flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">All Content</h2>

                            {/* Right Controls */}
                            <div className="hidden sm:flex items-center gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-60 h-9 pl-10 pr-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/[0.15]"
                                    />
                                </div>

                                {/* Filter Button */}
                                <button className="px-[14px] py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 flex items-center gap-2 hover:bg-white/[0.06] transition-colors">
                                    <Filter size={14} />
                                    <span>Filter</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Table */}
                        <div className="flex flex-col">
                            {contentRows.map((row, idx) => {
                                const Icon = row.icon
                                return (
                                    <div
                                        key={idx}
                                        className="h-16 px-4 grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-white/[0.04] transition-all duration-[120ms] hover:bg-white/[0.02] cursor-pointer"
                                    >
                                        {/* Status Icon */}
                                        <Icon
                                            size={18}
                                            style={{ color: row.iconColor }}
                                            strokeWidth={2}
                                        />

                                        {/* Title */}
                                        <p className="text-[15px] font-medium text-[#E8E9ED] truncate">
                                            {row.title}
                                        </p>

                                        {/* Category Badge */}
                                        <span
                                            className="hidden sm:inline-flex px-3 py-[6px] rounded-2xl text-xs font-medium whitespace-nowrap"
                                            style={{
                                                background: row.categoryBg,
                                                color: row.categoryColor
                                            }}
                                        >
                                            {row.category}
                                        </span>

                                        {/* Metrics */}
                                        <span className="hidden md:block text-sm text-white/40 min-w-[80px] text-right">
                                            {row.metrics}
                                        </span>

                                        {/* Avatar */}
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #5E6AD2, #8B5CF6)'
                                            }}
                                        >
                                            {row.avatar}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </main>
                </div>
            </div>

            {/* Dashboard Glow Effect Below */}
            <div
                className="absolute -bottom-[100px] left-1/2 -translate-x-1/2 w-[80%] h-[200px] pointer-events-none -z-10"
                style={{
                    background: 'radial-gradient(ellipse, rgba(94,106,210,0.15), transparent 60%)',
                    filter: 'blur(60px)'
                }}
            />
        </div>
    )
}
