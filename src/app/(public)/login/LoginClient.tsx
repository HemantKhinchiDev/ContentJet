"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isDisposableEmail } from "@/lib/isDisposableEmail";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Mode = "signin" | "signup";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  const redirect = params.get("redirect") || "/dashboard";
  const reason = params.get("reason");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = supabaseBrowser();

  const handleEmailAuth = async () => {
    setLoading(true);
    setError(null);

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
    setLoading(true);
    setError(null);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            {mode === "signin"
              ? "Welcome back to ContentJet"
              : "Create your ContentJet account"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue to your dashboard"
              : "Sign up to get started"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {reason === "verify-email" && (
            <p className="text-sm text-amber-600 text-center">
              Please verify your email to continue.
            </p>
          )}

          {reason === "reset-expired" && (
            <p className="text-sm text-red-500 text-center">
              Your password reset link has expired. Please request a new one.
            </p>
          )}

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            onClick={handleEmailAuth}
            className="w-full"
            disabled={loading || !email || !password}
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign in with Email"
              : "Create account"}
          </Button>

          {mode === "signin" && (
            <div className="text-center text-sm">
              <button
                type="button"
                className="underline text-muted-foreground"
                onClick={() => router.push("/reset-password")}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="text-center text-sm">
            {mode === "signin" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <Separator />

          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
