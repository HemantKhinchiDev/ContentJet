"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/auth/auth.context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }

    if (status === "unverified") {
      router.replace("/login?reason=verify-email");
    }
  }, [status, router]);

  if (status !== "auth") {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <nav className="space-y-2">
          <div className="font-semibold">Dashboard</div>
          <ul className="text-sm space-y-1">
            <li>Overview</li>
            <li>Content</li>
            <li>Settings</li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
