// src/auth/index.ts

export * from "./auth.types";
export * from "./auth.context";

import { isDevelopment } from "@/lib/env";
import { createSupabaseAuth } from "./adapters/supabase.auth";
import { createFakeAuth } from "./adapters/fake.auth";

/**
 * Factory function that returns the appropriate auth adapter
 * based on the current environment.
 * 
 * - Development (localhost): Fake auth (no Supabase required)
 * - Production (Vercel): Supabase OAuth (unchanged behavior)
 */
export function createAuthAdapter() {
  if (isDevelopment()) {
    return createFakeAuth();
  }

  return createSupabaseAuth();
}