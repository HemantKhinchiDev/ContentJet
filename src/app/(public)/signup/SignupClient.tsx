"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isDisposableEmail } from "@/lib/isDisposableEmail";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

// OAuth Provider Icons
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

export default function SignupClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = supabaseBrowser();

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    // Check for disposable email
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

    setSuccess(true);
  };

  const signInWithGoogle = async () => {
    setOauthLoading("google");
    setError(null);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGitHub = async () => {
    setOauthLoading("github");
    setError(null);

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const isFormDisabled = loading || oauthLoading !== null;

  // Success state - email verification required
  if (success) {
    return (
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="space-y-2 text-center pb-8">
          {/* Success icon */}
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <CardTitle className="text-3xl font-semibold">
            Check your email
          </CardTitle>

          <CardDescription className="text-base">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Click the link in your email to verify your account. If you
            don&apos;t see it, check your spam folder.
          </p>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-2 text-center pb-8">
        {/* Logo placeholder */}
        <div className="mx-auto mb-4 h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">C</span>
        </div>

        <CardTitle className="text-3xl font-semibold">
          Create your account
        </CardTitle>

        <CardDescription>
          Get started with your free account today
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OAuth buttons - priority order: Google, GitHub */}
        <div className="space-y-3">
          <OAuthButton
            provider="Google"
            icon={<GoogleIcon />}
            onClick={signInWithGoogle}
            loading={oauthLoading === "google"}
            disabled={isFormDisabled}
          />

          <OAuthButton
            provider="GitHub"
            icon={<GitHubIcon />}
            onClick={signInWithGitHub}
            loading={oauthLoading === "github"}
            disabled={isFormDisabled}
          />
        </div>

        {/* Divider */}
        <AuthDivider text="Or continue with email" />

        {/* Email/Password form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
          className="space-y-4"
        >
          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="email"
                error={!!error}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                autoComplete="new-password"
                error={!!error}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center" role="alert">
              {error}
            </p>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={isFormDisabled || !email || !password}
          >
            Create account
          </Button>
        </form>

        {/* Toggle to login */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-foreground hover:underline transition-colors"
            onClick={() => router.push("/login")}
          >
            Sign in
          </button>
        </p>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </CardContent>
    </Card>
  );
}