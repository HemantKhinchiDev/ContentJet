"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  CreditCard,
  Wand2,
  LayoutDashboard,
  X,
} from "lucide-react";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/auth/auth.context";
import { cn } from "@/lib/utils";
import { UsageProvider } from "@/context/UsageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Generate",
    href: "/dashboard/generate",
    icon: Wand2,
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const SIDEBAR_EXPAND_DELAY = 400;

interface Subscription {
  plan_type: string;
  stripe_customer_id?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ── Desktop sidebar state ────────────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Mobile drawer state ──────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const isExpanded = isPinned || isHovered;

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  // Redirect logic
  useEffect(() => {
    if (!ready) return;
    if (status === "guest") router.replace("/login");
    if (status === "unverified") router.replace("/login?reason=verify-email");
  }, [ready, status, router]);

  // Fetch subscription once authenticated
  useEffect(() => {
    if (status !== "auth") return;
    fetch("/api/subscriptions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSubscription(data))
      .catch(() => { });
  }, [status]);

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently fail
    } finally {
      setPortalLoading(false);
    }
  }, []);

  // ── Loading / guard states ───────────────────────────────────────────────────
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

  if (status !== "auth") return null;

  const userEmail = user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase() || "?";
  const planLabel = subscription
    ? subscription.plan_type === "free"
      ? "Free Plan"
      : `${subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan`
    : "Free Plan";

  // ── Shared nav link renderer ─────────────────────────────────────────────────
  const renderNavLink = (item: (typeof navItems)[0], expanded: boolean) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
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
            expanded ? "w-auto opacity-100" : "w-0 opacity-0"
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <UsageProvider>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen flex bg-background">

          {/* ── Mobile drawer backdrop ──────────────────────────────────────── */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* ── Mobile drawer ───────────────────────────────────────────────── */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-background border-r border-border transition-transform duration-300 ease-in-out md:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300">
                  <span className="text-sm font-bold text-white dark:text-zinc-900">CJ</span>
                </div>
                <span className="font-semibold text-sm text-foreground tracking-tight">
                  ContentJet
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => renderNavLink(item, true))}
            </nav>

            {/* Drawer footer */}
            <div className="px-2 py-2 border-t border-border space-y-1">
              <Link
                href="/help"
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                Help &amp; Support
              </Link>

              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {userEmail || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{planLabel}</p>
                </div>
              </div>

              {subscription?.stripe_customer_id && (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer w-full text-left disabled:opacity-50"
                >
                  <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                  {portalLoading ? "Loading…" : "Manage billing"}
                </button>
              )}
            </div>
          </div>

          {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
          <aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "hidden md:flex border-r border-border bg-muted/20 flex-col transition-all duration-300 ease-in-out",
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
                const navLink = renderNavLink(item, isExpanded);
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
                      <span className={cn("whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>
                        Help &amp; Support
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p>Help &amp; Support</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/help"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4 flex-shrink-0" />
                  <span className={cn("whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>
                    Help &amp; Support
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
                      <div className={cn("flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>
                        <p className="text-sm font-medium text-foreground truncate leading-tight">{userEmail || "User"}</p>
                        <p className="text-xs text-muted-foreground leading-tight capitalize">{planLabel}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p className="font-medium">{userEmail || "User"}</p>
                    <p className="text-xs text-muted-foreground">{planLabel}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {userInitial}
                  </div>
                  <div className={cn("flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden", isExpanded ? "w-auto opacity-100" : "w-0 opacity-0")}>
                    <p className="text-sm font-medium text-foreground truncate leading-tight">{userEmail || "User"}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{planLabel}</p>
                  </div>
                </div>
              )}

              {isExpanded && subscription?.stripe_customer_id && (
                <button
                  id="manage-billing-btn"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer w-full text-left disabled:opacity-50"
                >
                  <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                  {portalLoading ? "Loading…" : "Manage billing"}
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <Header onMenuToggle={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-auto bg-muted/10 pb-16 md:pb-0">
              {children}
            </main>
          </div>

          {/* ── Mobile bottom tab bar ───────────────────────────────────────── */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors flex-1",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </TooltipProvider>
    </UsageProvider>
  );
}