// src/auth/adapters/fake.auth.ts

import { AuthContextValue, AuthUser, AuthStatus } from "../auth.types";

/**
 * Fake auth adapter for local development.
 * 
 * - No network calls
 * - No Supabase dependency
 * - State persists in memory (resets on page refresh)
 * 
 * Uses getter pattern for reactive state (compatible with auth.context.tsx polling).
 */
export function createFakeAuth(): AuthContextValue {
  // Internal mutable state
  let status: AuthStatus = "guest";
  let user: AuthUser | null = null;

  return {
    // Always ready immediately (no async initialization)
    get ready() {
      return true;
    },

    get status() {
      return status;
    },

    get user() {
      return user;
    },

    async signIn() {
      // Simulate successful login with a demo user
      user = {
        id: "dev-user-001",
        email: "dev@localhost",
        name: "Development User",
        avatarUrl: undefined,
      };
      status = "auth";
    },

    async signOut() {
      user = null;
      status = "guest";
    },
  };
}