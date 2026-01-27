import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";

// Prevent static params generation
export const generateStaticParams = async () => [];

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Signing you in…</p></div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}