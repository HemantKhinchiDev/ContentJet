"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  History,
  CalendarDays,
  LayoutTemplate,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/auth/auth.context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Project", href: "/dashboard", icon: FolderKanban },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Today", href: "/dashboard/today", icon: CalendarDays },
  { label: "Template", href: "/dashboard/template", icon: LayoutTemplate },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const SIDEBAR_EXPAND_DELAY = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth(); // ✅ UI-only usage
  const pathname = usePathname();

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isExpanded = isPinned || isHovered;

  const handleMouseEnter = () => {
    if (isPinned) return;
    hoverTimeoutRef.current = setTimeout(
      () => setIsHovered(true),
      SIDEBAR_EXPAND_DELAY
    );
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const userEmail = user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "?";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "border-r border-border bg-muted/20 flex flex-col transition-all duration-300",
            isExpanded ? "w-52" : "w-14"
          )}
        >
          {/* Logo */}
          <div className="h-14 flex items-center border-b border-border relative px-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center">
                <span className="text-sm font-bold text-white dark:text-zinc-900">
                  CJ
                </span>
              </div>

              <span
                className={cn(
                  "font-semibold text-sm transition-all overflow-hidden",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                ContentJet
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={cn(
                    "absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center",
                    isExpanded
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                >
                  {isPinned ? (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelLeft className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPinned ? "Unpin sidebar" : "Pin sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              const link = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span
                    className={cn(
                      "transition-all overflow-hidden",
                      isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );

              return isExpanded ? (
                <div key={item.href}>{link}</div>
              ) : (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-2 py-2 border-t border-border">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {userInitial}
              </div>

              <div
                className={cn(
                  "transition-all overflow-hidden",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                <p className="text-sm font-medium truncate">
                  {userEmail || "User"}
                </p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
