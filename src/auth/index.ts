export * from "./auth.types";
export * from "./auth.context";

import { createSupabaseAuth } from "./adapters/supabase.auth";
// import { createFakeAuth } from "./adapters/fake.auth";

export function createAuthAdapter() {
  return createSupabaseAuth();
}
