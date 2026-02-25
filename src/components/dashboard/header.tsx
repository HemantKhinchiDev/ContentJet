"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageIndicator } from "./usage-indicator";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between">
      <div className="font-semibold text-foreground">Dashboard</div>

      <div className="flex items-center gap-2">
        <UsageIndicator used={3} limit={10} isPro={false} />

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href="/help" aria-label="Help Center" title="Help Center">
            <HelpCircle className="h-5 w-5" />
          </a>
        </Button>

        {/* User dropdown — avatar + plan badge + menu */}
        <UserMenu />
      </div>
    </header>
  );
}