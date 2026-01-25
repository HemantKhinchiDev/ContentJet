"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const signInWithGoogle = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirect}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            Welcome to ContentJet
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your dashboard
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full"
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
