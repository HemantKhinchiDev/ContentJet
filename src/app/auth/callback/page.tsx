"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Inner component that is allowed to use useSearchParams
 * because it is wrapped inside Suspense.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = supabaseBrowser();
      const code = searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return <p>Signing you in…</p>;
}

/**
 * Page component
 * Suspense boundary is REQUIRED by Next.js
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Signing you in…</p>}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
