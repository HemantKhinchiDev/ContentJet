"use client";

import { Moon, Sun, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageIndicator } from "./usage-indicator";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  title?: string;
  /** Called when the mobile hamburger is tapped */
  onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const getDefaultTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/history") return "History";
    if (pathname === "/dashboard/settings") return "Settings";
    if (pathname === "/dashboard/template") return "Templates";
    if (pathname.startsWith("/dashboard/generate")) return "Generate";
    return "Dashboard";
  };

  const displayTitle = title || getDefaultTitle();

  return (
    <header className="h-14 border-b border-border bg-background px-4 md:px-6 flex items-center gap-3 justify-between shadow-sm">
      {/* Hamburger — mobile only */}
      {onMenuToggle && (
        <button
          className="md:hidden h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <h1 className="text-[16px] font-semibold text-foreground truncate flex-1 max-w-[200px] md:max-w-xl">
        {displayTitle}
      </h1>

      <div className="flex items-center gap-2 md:gap-3">
        <UsageIndicator isPro={false} />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
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

        {/* User dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}