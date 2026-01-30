"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UsageIndicator } from "./usage-indicator";

type UserInfo = {
  email: string | null;
  avatarUrl: string | null;
};

export default function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? null,
          avatarUrl:
            data.user.user_metadata?.avatar_url ||
            data.user.user_metadata?.picture ||
            null,
        });
      }
    });
  }, []);

  const logout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const letter = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between">
      <div className="font-semibold text-foreground">Dashboard</div>

      <div className="flex items-center gap-3">
        <UsageIndicator used={3} limit={10} isPro={false} />

        {/* Help Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a
            href="/help"
            aria-label="Help"
            title="Help Center"
          >
            <HelpCircle className="h-5 w-5" />
          </a>
        </Button>

        {/* User Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {letter}
          </div>
        )}

        {/* Logout Button */}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}