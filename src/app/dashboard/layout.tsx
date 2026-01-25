"use client";

import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // DEV MODE: bypass auth completely
    setReady(true);
  }, []);

  if (!ready) {
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
