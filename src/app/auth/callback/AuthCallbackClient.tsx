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

      // Extract all relevant params
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const next = searchParams.get("next") || "/dashboard";

      try {
        // OAuth flow (Google / GitHub)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("OAuth exchange error:", error.message);
            router.replace("/login?reason=oauth-error");
            return;
          }

          router.replace(next);
          return;
        }

        // Email verification flow (signup / recovery / invite)
        if (tokenHash && type) {
          setStatus("Verifying your email…");

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "signup" | "recovery" | "invite" | "email",
          });

          if (error) {
            console.error("Email verification error:", error.message);
            router.replace("/login?reason=verification-failed");
            return;
          }

          // Verification successful — session should now exist
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            router.replace("/dashboard");
          } else {
            router.replace("/login?reason=session-missing");
          }
          return;
        }

        // No valid params — invalid callback
        router.replace("/login?reason=invalid-callback");
      } catch (err) {
        console.error("Auth callback error:", err);
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