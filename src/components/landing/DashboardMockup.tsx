'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Command, Plus, Filter, ChevronDown, MoreHorizontal, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export function DashboardMockup() {
    const [isVisible, setIsVisible] = useState(false)
    const dashboardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (dashboardRef.current) {
            observer.observe(dashboardRef.current)
        }

        return () => {
            if (dashboardRef.current) {
                observer.unobserve(dashboardRef.current)
            }
        }
    }, [])

    const issues = [
        { status: 'in-progress', priority: 'urgent', id: 'CJ-241', title: 'Implement OAuth integration for enterprise SSO', label: 'Feature', labelColor: '#5e6ad2', assignee: 'SK', date: 'Feb 14' },
        { status: 'in-progress', priority: 'high', id: 'CJ-240', title: 'Fix memory leak in WebSocket connection handler', label: 'Bug', labelColor: '#f43f5e', assignee: 'AM', date: 'Feb 14' },
        { status: 'done', priority: 'high', id: 'CJ-239', title: 'Add real-time collaboration cursors to editor', label: 'Feature', labelColor: '#5e6ad2', assignee: 'RT', date: 'Feb 12' },
        { status: 'done', priority: 'medium', id: 'CJ-238', title: 'Optimize database query performance for analytics', label: 'Improvement', labelColor: '#22d3ee', assignee: 'LC', date: 'Feb 12' },
        { status: 'done', priority: 'low', id: 'CJ-237', title: 'Update landing page hero section design', label: 'Design', labelColor: '#f59e0b', assignee: 'MK', date: 'Feb 11' },
        { status: 'todo', priority: 'medium', id: 'CJ-236', title: 'Add API rate limiting for public endpoints', label: 'Performance', labelColor: '#10b981', assignee: 'NP', date: 'Feb 15' },
        { status: 'todo', priority: 'low', id: 'CJ-235', title: 'Write documentation for new webhook events', label: 'Docs', labelColor: '#8b5cf6', assignee: 'JD', date: 'Feb 16' },
        { status: 'backlog', priority: 'low', id: 'CJ-234', title: 'Implement dark mode theme switcher', label: 'Feature', labelColor: '#5e6ad2', assignee: 'SK', date: 'Feb 20' },
        { status: 'backlog', priority: 'medium', id: 'CJ-233', title: 'Add automated security scan to CI pipeline', label: 'Security', labelColor: '#ec4899', assignee: 'AM', date: 'Feb 21' },
        { status: 'backlog', priority: 'low', id: 'CJ-232', title: 'Improve error messages for failed API calls', label: 'DevOps', labelColor: '#6366f1', assignee: 'RT', date: 'Feb 22' },
    ]

    const groupedIssues = {
        'in-progress': issues.filter(i => i.status === 'in-progress'),
        'done': issues.filter(i => i.status === 'done'),
        'todo': issues.filter(i => i.status === 'todo'),
        'backlog': issues.filter(i => i.status === 'backlog'),
    }

    const getPriorityIcon = (priority: string) => {
        const colors = {
            urgent: '#f43f5e',
            high: '#fb923c',
            medium: '#fbbf24',
            low: '#94a3b8'
        }
        return (
            <svg width="14" height="14" viewBox="0 0 14 14">
                <rect x="2" y="10" width="2" height="2" fill={colors[priority as keyof typeof colors]} opacity={priority === 'low' ? 0.3 : 1} />
                <rect x="6" y="7" width="2" height="5" fill={colors[priority as keyof typeof colors]} opacity={priority === 'low' || priority === 'medium' ? 0.3 : 1} />
                <rect x="10" y="4" width="2" height="8" fill={colors[priority as keyof typeof colors]} opacity={priority !== 'urgent' && priority !== 'high' ? 0.3 : 1} />
            </svg>
        )
    }

    const getStatusIcon = (status: string) => {
        if (status === 'done') return <CheckCircle2 size={14} className="text-[#5e6ad2]" strokeWidth={2.5} />
        if (status === 'in-progress') return <div className="w-3.5 h-3.5 rounded-full border-2 border-[#fbbf24] border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        if (status === 'todo') return <Circle size={14} className="text-white/20" strokeWidth={2} strokeDasharray="2 2" />
        return <Circle size={14} className="text-white/10" strokeWidth={1.5} />
    }

    return (
        <div
            ref={dashboardRef}
            className={`relative rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            style={{
                boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 30px 60px rgba(0,0,0,0.5), 0 -4px 20px rgba(0,0,0,0.3)',
                minHeight: '680px'
            }}
        >
            {/* Window Chrome - Top Bar */}
            <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                    {/* macOS Traffic Lights */}
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="h-10 border-b border-white/[0.04] flex items-center justify-between px-4 bg-[#0d0d0d]">
                <div className="flex items-center gap-1">
                    <button className="px-3 py-1.5 text-[12px] text-white/80 bg-white/[0.06] rounded-md">My Issues</button>
                    <button className="px-3 py-1.5 text-[12px] text-white/40 hover:text-white/60">Active Cycle</button>
                    <button className="px-3 py-1.5 text-[12px] text-white/40 hover:text-white/60">Roadmap</button>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-md px- py-1 border border-white/[0.06]">
                    <Search size={12} className="text-white/30 ml-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[12px] text-white/60 placeholder:text-white/20 w-40"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.06] rounded text-[10px] text-white/30 mr-1">
                        <Command size={8} />
                        <span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex h-[456px]">
                {/* Sidebar */}
                <div className="w-[220px] border-r border-white/[0.06] bg-[#0a0a0a] p-3 overflow-y-auto">
                    {/* Workspace Switcher */}
                    <div className="mb-4 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#5e6ad2] to-[#8b5cf6] flex items-center justify-center text-[11px] font-semibold text-white">
                                C
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-medium text-white/90 truncate">Contentjet</div>
                                <div className="text-[10px] text-white/30">Pro Plan</div>
                            </div>
                            <ChevronDown size={12} className="text-white/30" />
                        </div>
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-0.5 mb-4">
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">
                            <span>Inbox</span>
                            <span className="ml-auto px-1.5 py-0.5 bg-[#5e6ad2]/20 text-[#818cf8] text-[10px] rounded">3</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/90 bg-white/[0.06] rounded">
                            My Issues
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">
                            Views
                        </button>
                    </div>

                    {/* Workspace Section */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between px-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium">Workspace</span>
                            <Plus size={12} className="text-white/25" />
                        </div>
                        <div className="space-y-0.5">
                            <button className="w-full text-left px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">Roadmap</button>
                            <button className="w-full text-left px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">Projects</button>
                            <button className="w-full text-left px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">Cycles</button>
                        </div>
                    </div>

                    {/* Teams Section */}
                    <div>
                        <div className="px-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-white/25 font-medium">Teams</span>
                        </div>
                        <div className="space-y-0.5">
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">
                                <div className="w-4 h-4 rounded bg-[#3b82f6] flex items-center justify-center text-[9px] font-semibold text-white">E</div>
                                Engineering
                            </button>
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">
                                <div className="w-4 h-4 rounded bg-[#ec4899] flex items-center justify-center text-[9px] font-semibold text-white">D</div>
                                Design
                            </button>
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.03] rounded">
                                <div className="w-4 h-4 rounded bg-[#f59e0b] flex items-center justify-center text-[9px] font-semibold text-white">P</div>
                                Product
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                        <button className="w-full text-left px-2 py-1.5 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.03] rounded">
                            Settings
                        </button>
                    </div>
                </div>

                {/* Main Content - Issue List */}
                <div className="flex-1 bg-[#111113] overflow-y-auto">
                    {/* Toolbar */}
                    <div className="sticky top-0 bg-[#111113] border-b border-white/[0.04] p-3 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[12px]">
                                <span className="text-white/60">My Issues</span>
                                <ChevronDown size={12} className="text-white/30" />
                                <span className="text-white/30">&gt;</span>
                                <span className="text-white/90">All Issues</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-md">
                                    <Filter size={11} />
                                    Filter
                                </button>
                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-md">
                                    Sort
                                    <ChevronDown size={11} />
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-white bg-[#5e6ad2] hover:bg-[#505ac0] rounded-md font-medium">
                                    <Plus size={11} />
                                    New Issue
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Issue Groups */}
                    <div className="p-3 space-y-4">
                        {/* In Progress */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <div className="w-3 h-3 rounded-full border-2 border-[#fbbf24]" style={{ borderLeftColor: 'transparent' }} />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">In Progress</span>
                                <span className="text-[11px] text-white/20">{groupedIssues['in-progress'].length}</span>
                            </div>
                            {groupedIssues['in-progress'].map((issue) => (
                                <div key={issue.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/[0.02] rounded cursor-pointer group">
                                    {getPriorityIcon(issue.priority)}
                                    <span className="font-mono text-[11px] text-white/30 w-12">{issue.id}</span>
                                    {getStatusIcon(issue.status)}
                                    <span className="flex-1 text-[12px] text-white/70 group-hover:text-white/90">{issue.title}</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: `${issue.labelColor}20`, color: issue.labelColor }}>{issue.label}</span>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#8b5cf6] flex items-center justify-center text-[9px] font-semibold text-white">{issue.assignee}</div>
                                    <span className="text-[11px] text-white/25 w-12 text-right">{issue.date}</span>
                                </div>
                            ))}
                        </div>

                        {/* Done */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <CheckCircle2 size={12} className="text-[#5e6ad2]" />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Done</span>
                                <span className="text-[11px] text-white/20">{groupedIssues['done'].length}</span>
                            </div>
                            {groupedIssues['done'].map((issue) => (
                                <div key={issue.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/[0.02] rounded cursor-pointer group opacity-60">
                                    {getPriorityIcon(issue.priority)}
                                    <span className="font-mono text-[11px] text-white/30 w-12">{issue.id}</span>
                                    {getStatusIcon(issue.status)}
                                    <span className="flex-1 text-[12px] text-white/70 group-hover:text-white/90 line-through">{issue.title}</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: `${issue.labelColor}20`, color: issue.labelColor }}>{issue.label}</span>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#8b5cf6] flex items-center justify-center text-[9px] font-semibold text-white">{issue.assignee}</div>
                                    <span className="text-[11px] text-white/25 w-12 text-right">{issue.date}</span>
                                </div>
                            ))}
                        </div>

                        {/* Todo */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <Circle size={12} className="text-white/20" strokeDasharray="2 2" />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Todo</span>
                                <span className="text-[11px] text-white/20">{groupedIssues['todo'].length}</span>
                            </div>
                            {groupedIssues['todo'].map((issue) => (
                                <div key={issue.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/[0.02] rounded cursor-pointer group">
                                    {getPriorityIcon(issue.priority)}
                                    <span className="font-mono text-[11px] text-white/30 w-12">{issue.id}</span>
                                    {getStatusIcon(issue.status)}
                                    <span className="flex-1 text-[12px] text-white/70 group-hover:text-white/90">{issue.title}</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: `${issue.labelColor}20`, color: issue.labelColor }}>{issue.label}</span>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#8b5cf6] flex items-center justify-center text-[9px] font-semibold text-white">{issue.assignee}</div>
                                    <span className="text-[11px] text-white/25 w-12 text-right">{issue.date}</span>
                                </div>
                            ))}
                        </div>

                        {/* Backlog */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <Circle size={12} className="text-white/10" />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Backlog</span>
                                <span className="text-[11px] text-white/20">{groupedIssues['backlog'].length}</span>
                            </div>
                            {groupedIssues['backlog'].map((issue) => (
                                <div key={issue.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/[0.02] rounded cursor-pointer group opacity-50">
                                    {getPriorityIcon(issue.priority)}
                                    <span className="font-mono text-[11px] text-white/30 w-12">{issue.id}</span>
                                    {getStatusIcon(issue.status)}
                                    <span className="flex-1 text-[12px] text-white/70 group-hover:text-white/90">{issue.title}</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: `${issue.labelColor}20`, color: issue.labelColor }}>{issue.label}</span>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#8b5cf6] flex items-center justify-center text-[9px] font-semibold text-white">{issue.assignee}</div>
                                    <span className="text-[11px] text-white/25 w-12 text-right">{issue.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
