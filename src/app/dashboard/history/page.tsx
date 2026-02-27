'use client';

import { useState, useEffect } from 'react';
import { FileText, Copy, Download, Trash2, Calendar, FileJson, ChevronLeft, MessageSquare, Mail, Newspaper, ShoppingBag, Video, Search, Edit3 } from 'lucide-react';
import { HistoryManager, HistoryItem } from '@/lib/history-manager';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'blog', name: 'Blog Post' },
    { id: 'social', name: 'Social Media' },
    { id: 'email_subject', name: 'Email Subject' },
    { id: 'newsletter', name: 'Newsletter' },
    { id: 'product', name: 'Product Description' },
    { id: 'video_script', name: 'Video Script' },
    { id: 'seo_meta', name: 'SEO Meta' },
    { id: 'rewrite', name: 'Content Rewrite' },
];

const dateFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'week', name: 'Last 7 Days' },
    { id: 'month', name: 'Last 30 Days' },
];

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const allHistory = HistoryManager.getAll();
        setHistory(allHistory);
        if (allHistory.length > 0 && window.innerWidth >= 768) {
            setSelectedItem(allHistory[0]);
        }
    }, []);

    // Filter logic
    const filteredHistory = history.filter(item => {
        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
            return false;
        }

        // Date filter
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today' && diffDays !== 0) return false;
        if (dateFilter === 'yesterday' && diffDays !== 1) return false;
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;

        return true;
    });

    // Group by date
    const groupedHistory = groupByDate(filteredHistory);

    // Actions
    const handleCopy = async () => {
        if (!selectedItem) return;
        try {
            await navigator.clipboard.writeText(selectedItem.content);
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Failed to copy to clipboard');
        }
    };

    const handleDownload = () => {
        if (!selectedItem) return;
        const blob = new Blob([selectedItem.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        if (confirm('Delete this item?')) {
            HistoryManager.delete(selectedItem.id);
            const newHistory = HistoryManager.getAll();
            setHistory(newHistory);
            setSelectedItem(null);
        }
    };

    if (!isClient) return null;

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            {/* Sidebar */}
            <aside className={`w-full md:w-[280px] border-r border-gray-200 dark:border-[color:lab(15%_0_0)] 
                       bg-white dark:bg-[color:lab(2.75381%_0_0)] 
                       flex-col shrink-0 overflow-hidden ${selectedItem ? 'hidden md:flex' : 'flex'}`}>

                {/* Filters */}
                <div className="px-4 py-3 space-y-2 border-b border-gray-200 dark:border-[color:lab(15%_0_0)] shrink-0">
                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-1.5 
                     bg-gray-50 dark:bg-[color:lab(8%_0_0)]
                     border border-gray-200 dark:border-[color:lab(15%_0_0)]
                     text-gray-900 dark:text-white outline-none
                     rounded-md text-sm cursor-pointer"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-1.5 
                     bg-gray-50 dark:bg-[color:lab(8%_0_0)]
                     border border-gray-200 dark:border-[color:lab(15%_0_0)]
                     text-gray-900 dark:text-white outline-none
                     rounded-md text-sm cursor-pointer"
                    >
                        {dateFilters.map(date => (
                            <option key={date.id} value={date.id}>{date.name}</option>
                        ))}
                    </select>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto w-full pb-4">
                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No history found</p>
                        </div>
                    ) : (
                        Object.entries(groupedHistory).map(([dateLabel, items]) => (
                            <div key={dateLabel} className="pt-4">
                                {/* Date Header */}
                                <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {dateLabel}
                                </div>

                                {/* Items - Simple Style Like Main Menu */}
                                <div className="px-2">
                                    {items.map((item) => (
                                        <Tooltip key={item.id}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors group ${selectedItem?.id === item.id
                                                        ? 'bg-gray-100 dark:bg-zinc-800/80 text-gray-900 dark:text-white font-medium'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                >
                                                    {getCategoryIcon(item.category)}
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-[14px] truncate ${selectedItem?.id === item.id ? 'text-gray-900 dark:text-white font-medium' : 'font-medium'}`}>
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" sideOffset={8}>
                                                <p>{getCategoryName(item.category)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`${selectedItem ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-gray-50 dark:bg-[color:lab(2.75381%_0_0)] overflow-hidden`}>
                {!selectedItem ? (
                    // Empty State
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Select an item</p>
                            <p className="text-sm">Choose a conversation from the sidebar to view details</p>
                        </div>
                    </div>
                ) : (
                    // Content View
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto p-8 w-full">

                            {/* Category Badge & Mobile Back */}
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="md:hidden p-1.5 -ml-1.5 mr-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-500"
                                    aria-label="Back to history list"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 
                                bg-white dark:bg-zinc-800/80 
                                border border-gray-200 dark:border-[color:lab(15%_0_0)]
                                text-gray-600 dark:text-gray-300
                                rounded-md text-[13px] font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    {getCategoryName(selectedItem.category)}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white mb-3">
                                {selectedItem.title}
                            </h1>

                            {/* Metadata */}
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatFullDate(selectedItem.timestamp)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FileJson className="w-4 h-4" />
                                    {selectedItem.wordCount} words • {Math.max(1, Math.ceil(selectedItem.wordCount / 200))} min read
                                </span>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200 dark:border-[color:lab(15%_0_0)] mb-8" />

                            {/* Content */}
                            <div className="prose prose-gray dark:prose-invert max-w-none mb-8 w-full">
                                <pre className="whitespace-pre-wrap bg-transparent border-none text-gray-800 dark:text-gray-200 text-[15px] font-sans leading-relaxed p-0 m-0">
                                    {selectedItem.content}
                                </pre>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200 dark:border-[color:lab(15%_0_0)] mb-6" />

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 
                           bg-gray-900 dark:bg-white 
                           text-white dark:text-gray-900 font-medium
                           rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Text
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 
                           border border-gray-200 dark:border-[color:lab(20%_0_0)]
                           bg-white dark:bg-transparent
                           text-gray-700 dark:text-gray-300 font-medium
                           rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 
                           transition-colors text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 
                           bg-red-50 dark:bg-red-900/10
                           text-red-600 dark:text-red-400 font-medium
                           rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 
                           transition-colors text-sm ml-auto"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Helper Functions
function groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
    const groups: Record<string, HistoryItem[]> = {};
    const now = new Date();

    items.forEach(item => {
        const date = new Date(item.timestamp);
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        let label: string;
        if (diffDays === 0) label = 'Today';
        else if (diffDays === 1) label = 'Yesterday';
        else if (diffDays <= 7) label = 'This Week';
        else if (diffDays <= 30) label = 'This Month';
        else label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });

    return groups;
}

function getCategoryName(category: string): string {
    const names: Record<string, string> = {
        blog: 'Blog Post',
        social: 'Social Media',
        email_subject: 'Email Subject',
        newsletter: 'Newsletter',
        product: 'Product Description',
        video_script: 'Video Script',
        seo_meta: 'SEO Meta',
        rewrite: 'Content Rewrite',
    };
    return names[category] || category;
}

function getCategoryIcon(category: string) {
    const icons: Record<string, any> = {
        blog: FileText,
        social: MessageSquare,
        email_subject: Mail,
        newsletter: Newspaper,
        product: ShoppingBag,
        video_script: Video,
        seo_meta: Search,
        rewrite: Edit3,
    };
    const Icon = icons[category] || FileText;
    return <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />;
}

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
