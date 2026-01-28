"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isDisposableEmail } from "@/lib/isDisposableEmail";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

type Mode = "signin" | "signup";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  const redirect = params.get("redirect") || "/dashboard";
  const reason = params.get("reason");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const supabase = supabaseBrowser();

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: "email" | "password") => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmailAuth = async () => {
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      router.push(redirect);
      router.refresh();
    }

    if (mode === "signup") {
      if (isDisposableEmail(email)) {
        setLoading(false);
        setError("Disposable email addresses are not allowed.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      setError("Please verify your email to continue.");
    }
  };

  const signInWithGoogle = async () => {
    setOauthLoading("google");
    setError(null);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", redirect);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  };

  const signInWithGitHub = async () => {
    setOauthLoading("github");
    setError(null);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", redirect);

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  };

  const isFormDisabled = loading || oauthLoading !== null;

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 mb-3">
              <span className="text-lg font-bold text-white dark:text-zinc-900">CJ</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "signin"
                ? "Sign in to access your dashboard"
                : "Get started with your free account"}
            </p>
          </div>

          {reason === "verify-email" && (
            <div className="text-sm text-amber-600 dark:text-amber-500 text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50 mb-5">
              Please verify your email to continue.
            </div>
          )}

          {reason === "reset-expired" && (
            <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-5">
              Your password reset link has expired.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <OAuthButton
              provider="Google"
              icon={<GoogleIcon />}
              onClick={signInWithGoogle}
              loading={oauthLoading === "google"}
              disabled={isFormDisabled}
              fullWidth={false}
              className="w-full"
            >
              Google
            </OAuthButton>

            <OAuthButton
              provider="GitHub"
              icon={<GitHubIcon />}
              onClick={signInWithGitHub}
              loading={oauthLoading === "github"}
              disabled={isFormDisabled}
              fullWidth={false}
              className="w-full"
            >
              GitHub
            </OAuthButton>
          </div>

          <AuthDivider text="Or continue with email" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailAuth();
            }}
            className="space-y-4 mt-5"
          >
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                disabled={isFormDisabled}
                autoComplete="email"
                error={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                disabled={isFormDisabled}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                error={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => router.push("/reset-password")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive text-center" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={isFormDisabled}
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-foreground hover:underline transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-foreground hover:underline transition-colors">
              Privacy Policy
            </a>
          </p>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </a>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-700/20 via-transparent to-transparent" />

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Create, schedule, and publish — all in one place
          </h2>
          <p className="text-zinc-400 mt-3 text-lg">
            ContentJet streamlines your content workflow so you can focus on what matters.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">AI-powered drafts tailored to your brand voice</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">Multi-platform scheduling with one click</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">Unified analytics to track performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}