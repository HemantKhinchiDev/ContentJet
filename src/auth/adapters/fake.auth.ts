import { AuthAdapter, AuthUser, AuthStatus, AuthSubscriber, AuthState } from "../auth.types";

/**
 * Fake auth adapter for development/testing
 * Simulates authenticated state without Supabase
 */
export function createFakeAuth(): AuthAdapter {
  let ready = false;
  let status: AuthStatus = "guest";
  let user: AuthUser | null = null;

  const subscribers = new Set<AuthSubscriber>();

  function notify() {
    const state: AuthState = { ready, status, user };
    subscribers.forEach((callback) => callback(state));
  }

  // Simulate async initialization
  setTimeout(() => {
    // Check localStorage for persisted fake session
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fake-auth-user");
      if (stored) {
        try {
          user = JSON.parse(stored);
          status = "auth";
        } catch {
          // Invalid stored data
        }
      }
    }
    ready = true;
    notify();
  }, 100);

  return {
    get ready() {
      return ready;
    },

    get status() {
      return status;
    },

    get user() {
      return user;
    },

    subscribe(callback: AuthSubscriber) {
      subscribers.add(callback);
      callback({ ready, status, user });
      return () => {
        subscribers.delete(callback);
      };
    },

    async signIn() {
      // Simulate OAuth flow with fake user
      user = {
        id: "fake-user-123",
        email: "dev@example.com",
        name: "Dev User",
        avatarUrl: undefined,
      };
      status = "auth";

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("fake-auth-user", JSON.stringify(user));
      }

      notify();
    },

    async signOut() {
      user = null;
      status = "guest";

      if (typeof window !== "undefined") {
        localStorage.removeItem("fake-auth-user");
      }

      notify();
    },
  };
}