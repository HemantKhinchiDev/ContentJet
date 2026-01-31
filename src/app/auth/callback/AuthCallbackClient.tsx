"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = supabaseBrowser();

      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/dashboard";

      try {
        // 🔐 OAuth callback (Google / GitHub)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("OAuth exchange error:", error.message);
            router.replace("/login?reason=oauth-error");
            return;
          }

          // ✅ IMPORTANT: confirm session exists
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            console.error("Session missing after OAuth exchange");
            router.replace("/login?reason=session-missing");
            return;
          }

          router.replace(next);
          return;
        }

        // ❌ Invalid callback
        router.replace("/login?reason=invalid-callback");
      } catch (err) {
        console.error("Auth callback unexpected error:", err);
        router.replace("/login?reason=unexpected-error");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">{status}</p>
    </div>
  );
}
