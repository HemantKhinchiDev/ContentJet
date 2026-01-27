import { Suspense } from "react";
import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Sign Up | ContentJet",
  description: "Create your free ContentJet account and get started today.",
};

function SignupLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Logo placeholder */}
      <div className="flex justify-center">
        <div className="h-10 w-10 rounded-lg bg-muted" />
      </div>

      {/* Title placeholder */}
      <div className="space-y-2 flex flex-col items-center">
        <div className="h-8 w-52 rounded bg-muted" />
        <div className="h-4 w-60 rounded bg-muted" />
      </div>

      {/* OAuth buttons placeholder */}
      <div className="space-y-3 pt-4">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>

      {/* Divider placeholder */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
        <div className="flex-1 h-px bg-muted" />
      </div>

      {/* Form placeholder */}
      <div className="space-y-4">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupClient />
    </Suspense>
  );
}