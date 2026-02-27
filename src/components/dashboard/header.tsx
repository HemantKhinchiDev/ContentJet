"use client";

import { Moon, Sun, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageIndicator } from "./usage-indicator";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  title?: string; // Dynamic title override (not natively scoped yet)
}

export default function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Default title based on route logic provided
  const getDefaultTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/history') return 'History';
    if (pathname === '/dashboard/settings') return 'Settings';
    if (pathname === '/dashboard/template') return 'Templates';
    if (pathname.startsWith('/dashboard/generate')) return 'Generate';
    return 'Dashboard';
  };

  const displayTitle = title || getDefaultTitle();

  return (
    <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-[16px] font-semibold text-foreground truncate max-w-[200px] md:max-w-xl">
        {displayTitle}
      </h1>

      <div className="flex items-center gap-2 md:gap-3">
        <UsageIndicator isPro={false} />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          asChild
        >
          <a href="/help" aria-label="Help Center" title="Help Center">
            <HelpCircle className="h-4 w-4" />
          </a>
        </Button>

        {/* User dropdown — avatar + plan badge + menu */}
        <UserMenu />
      </div>
    </header>
  );
}