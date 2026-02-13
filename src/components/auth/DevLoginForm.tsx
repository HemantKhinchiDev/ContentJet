// src/components/auth/DevLoginForm.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/auth/auth.context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Development-only login form.
 * 
 * This component is ONLY rendered when isDevelopment() is true.
 * It uses the fake auth adapter which requires no Supabase connection.
 * 
 * The email/password fields are for UX consistency but are not validated —
 * any input will successfully authenticate as the dev user.
 */
export function DevLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const redirect = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("dev@localhost");
  const [password, setPassword] = useState("dev");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn();

      // Set cookie for middleware authentication (backup mechanism)
      document.cookie = 'dev-auth-token=true; path=/; max-age=86400';

      // Debug logging
      console.log('✅ SignIn complete, redirecting to:', redirect);

      // Use window.location for guaranteed redirect
      // router.push() can be unreliable during auth state changes
      window.location.href = redirect;

    } catch (error) {
      console.error("❌ Dev login error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Dev mode banner */}
      <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200 text-center font-medium">
          🛠️ Development Mode
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-1">
          Using local auth — no Supabase connection required
        </p>
      </div>

      {/* Logo and heading */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 mb-3">
          <span className="text-lg font-bold text-white dark:text-zinc-900">CJ</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Development Login
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in with any credentials
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="dev-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="dev-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="dev-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            id="dev-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Sign in as Dev User
        </Button>
      </form>

      {/* Info text */}
      <p className="text-xs text-center text-muted-foreground mt-6">
        This login bypasses Supabase authentication.
        <br />
        In production, users will see OAuth options.
      </p>
    </div>
  );
}