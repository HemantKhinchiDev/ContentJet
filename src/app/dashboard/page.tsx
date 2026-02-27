"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  MessageSquare,
  Mail,
  Newspaper,
  ShoppingBag,
  Video,
  Search,
  Edit3
} from "lucide-react";
import { HistoryManager, HistoryItem } from "@/lib/history-manager";

const generateOptions = [
  { name: 'Blog Post', href: '/dashboard/generate?template=BLOG_POST', icon: FileText },
  { name: 'Social Media', href: '/dashboard/generate?template=SOCIAL_POST', icon: MessageSquare },
  { name: 'Email Subject', href: '/dashboard/generate?template=EMAIL_SUBJECT', icon: Mail },
  { name: 'Newsletter', href: '/dashboard/generate?template=EMAIL_NEWSLETTER', icon: Newspaper },
  { name: 'Product Description', href: '/dashboard/generate?template=PRODUCT_DESCRIPTION', icon: ShoppingBag },
  { name: 'Video Script', href: '/dashboard/generate?template=VIDEO_SCRIPT', icon: Video },
  { name: 'SEO Meta', href: '/dashboard/generate?template=SEO_META', icon: Search },
  { name: 'Content Rewrite', href: '/dashboard/generate?template=CONTENT_REWRITE', icon: Edit3 },
];

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    blog: 'Blog',
    social: 'Social',
    email_subject: 'Email',
    newsletter: 'Newsletter',
    product: 'Product',
    video_script: 'Video',
    seo_meta: 'SEO',
    rewrite: 'Rewrite',
  };
  return names[category] || category;
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return `Yesterday`;
  return `${diffDays}d ago`;
}

function getMostUsedCategory(items: HistoryItem[]): string {
  if (items.length === 0) return 'None';
  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return getCategoryName(mostUsed[0]);
}

export default function DashboardPage() {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRecentActivity(HistoryManager.getAll());
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-full py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-1.5 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your content today.
          </p>
        </header>

        {/* Dashboard Placeholder Stats (Static for now) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center space-y-1">
            <span className="text-2xl font-bold">{recentActivity.length}</span>
            <span className="text-sm text-muted-foreground">Total Content</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center space-y-1">
            <span className="text-2xl font-bold">{getMostUsedCategory(recentActivity)}</span>
            <span className="text-sm text-muted-foreground">Most Used</span>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-card border border-border rounded-xl p-6 mt-8">
          {/* Header with Create New */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>

            <div className="flex items-center gap-4">
              {/* Create New Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 
                           bg-gray-900 dark:bg-white 
                           text-white dark:text-gray-900 
                           text-sm font-medium rounded-lg
                           hover:bg-gray-800 dark:hover:bg-gray-100 
                           transition-colors
                           shadow-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Create New
                </button>

                {/* Dropdown Menu */}
                {showCreateMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 z-20
                                  bg-popover
                                  border border-border
                                  rounded-lg shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
                      <div className="py-1">
                        {generateOptions.map((option) => (
                          <Link
                            key={option.href}
                            href={option.href}
                            onClick={() => setShowCreateMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5
                                       text-foreground
                                       hover:bg-muted/50
                                       transition-colors text-sm"
                          >
                            <option.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                            {option.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* View All Link */}
              <Link
                href="/dashboard/history"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground
                         hover:text-foreground transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Activity List */}
          {recentActivity.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-lg">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start creating content to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href="/dashboard/history"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-muted/50
                           transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getCategoryName(item.category)} • {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}