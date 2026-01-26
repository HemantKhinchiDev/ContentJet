export const dynamic = "force-dynamic";

"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Signing you in…</p>}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
