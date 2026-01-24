"use client";

import { useState } from "react";
import { AuthGateModal } from "@/components/auth/AuthGateModal";


export default function DashboardPage() {
  // 🚨 TEMPORARY UI-ONLY FLAG (Step 5.7.a)
  // This will be REMOVED in Step 5.7.b (Supabase Auth)
  const [isLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <AuthGateModal
        open={true}
        onClose={() => {
          // do nothing for now
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Logged-in dashboard content will render here.
      </p>
    </div>
  );
}
