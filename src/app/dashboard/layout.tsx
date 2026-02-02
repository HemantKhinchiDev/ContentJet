"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  History,
  CalendarDays,
  LayoutTemplate,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Loader2,
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
  {
    label: "Project",
    href: "/dashboard",
    icon: FolderKanban,
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Today",
    href: "/dashboard/today",
    icon: CalendarDays,
  },
  {
    label: "Template",
    href: "/dashboard/template",
    icon: LayoutTemplate,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const SIDEBAR_EXPAND_DELAY = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isExpanded = isPinned || isHovered;

  const handleMouseEnter = () => {
    if (isPinned) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, SIDEBAR_EXPAND_DELAY);
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

  // Redirect logic - only after auth is ready
  useEffect(() => {
    if (!ready) return;

    if (status === "guest") {
      router.replace("/login");
    }

    if (status === "unverified") {
      router.replace("/login?reason=verify-email");
    }
  }, [ready, status, router]);

  // Show loading while auth is initializing
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard for non-authenticated users
  if (status !== "auth") {
    return null;
  }

  const userEmail = user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "?";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex bg-background">
        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "border-r border-border bg-muted/20 flex flex-col transition-all duration-300 ease-in-out",
            isExpanded ? "w-52" : "w-14"
          )}
        >
          <div className="h-14 flex items-center border-b border-border relative px-2.5">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300">
                <span className="text-sm font-bold text-white dark:text-zinc-900">CJ</span>
              </div>

              <span
                className={cn(
                  "font-semibold text-sm text-foreground tracking-tight whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                  isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                )}
              >
                ContentJet
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                  className={cn(
                    "absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 cursor-pointer",
                    isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  {isPinned ? (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  ) : (
                    <PanelLeft className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p>{isPinned ? "Unpin sidebar" : "Pin sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              const navLink = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />

                  <span
                    className={cn(
                      "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                      isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{navLink}</div>;
            })}
          </nav>

          <div className="px-2 py-2 border-t border-border space-y-1">
            {!isExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/help"
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span
                      className={cn(
                        "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                        isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                      )}
                    >
                      Help & Support
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>Help & Support</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/help"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
                    isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                  )}
                >
                  Help & Support
                </span>
              </Link>
            )}

            {!isExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {userInitial}
                    </div>

                    <div
                      className={cn(
                        "flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden",
                        isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground truncate leading-tight">
                        {userEmail || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">Free Plan</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p className="font-medium">{userEmail || "User"}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {userInitial}
                </div>

                <div
                  className={cn(
                    "flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden",
                    isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                  )}
                >
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {userEmail || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">Free Plan</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto bg-muted/10">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}