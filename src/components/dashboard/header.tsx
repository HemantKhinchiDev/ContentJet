"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

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
          email: data.user.email ?? null, // ✅ FIX HERE
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
    <header className="h-14 border-b px-6 flex items-center justify-between">
      <div className="font-semibold">Dashboard</div>

      <div className="flex items-center gap-3">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
            {letter}
          </div>
        )}

        <span className="text-sm text-muted-foreground">
          {user?.email}
        </span>

        <button
          onClick={logout}
          className="text-sm px-3 py-1 rounded border hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
