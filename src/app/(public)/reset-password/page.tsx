"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <Card className="rounded-xl border shadow-xl shadow-black/5 dark:shadow-black/50 bg-card">
        <CardHeader className="text-center pb-6 pt-12 px-8">
          {/* Success icon */}
          <div className="mx-auto mb-6 relative inline-block">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight">
            Check your email
          </CardTitle>

          <CardDescription className="text-sm">
            We sent a reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-8 pb-8">
          <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground text-center">
            Click the link in your email to reset your password. Check your
            spam folder if you don&apos;t see it.
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSent(false)}
            >
              Try a different email
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  return (
    <Card className="rounded-xl border shadow-xl shadow-black/5 dark:shadow-black/50 bg-card">
      <CardHeader className="text-center pb-4 pt-8 px-8">
        {/* CJ Logo */}
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300">
          <span className="text-lg font-bold text-white dark:text-zinc-900">CJ</span>
        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight">
          Reset your password
        </CardTitle>

        <CardDescription className="text-sm">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-8 pb-8">
        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReset();
          }}
          className="space-y-4"
        >
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              error={!!error}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive text-center" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading || !email.trim()}
          >
            Send reset link
          </Button>
        </form>

        {/* Bottom nav row */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => router.push("/login")}
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
