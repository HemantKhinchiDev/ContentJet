import { AuthAdapter, AuthUser, AuthStatus, AuthSubscriber, AuthState } from "../auth.types";
import { supabaseBrowser } from "@/lib/supabase/client";

export function createSupabaseAuth(): AuthAdapter {
  const supabase = supabaseBrowser();

  let ready = false;
  let status: AuthStatus = "guest";
  let user: AuthUser | null = null;

  // Subscribers list
  const subscribers = new Set<AuthSubscriber>();

  // Notify all subscribers of state change
  function notify() {
    const state: AuthState = { ready, status, user };
    subscribers.forEach((callback) => callback(state));
  }

  // Update state helper
  function updateState(newReady: boolean, newStatus: AuthStatus, newUser: AuthUser | null) {
    ready = newReady;
    status = newStatus;
    user = newUser;
    notify();
  }

  // Parse session user to AuthUser
  function parseUser(sessionUser: { 
    id: string; 
    email?: string; 
    email_confirmed_at?: string | null;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | undefined | null): { status: AuthStatus; user: AuthUser | null } {
    if (!sessionUser) {
      return { status: "guest", user: null };
    }

    const authUser: AuthUser = {
      id: sessionUser.id,
      email: sessionUser.email ?? "",
      name: sessionUser.user_metadata?.full_name,
      avatarUrl: sessionUser.user_metadata?.avatar_url,
    };

    const authStatus: AuthStatus = sessionUser.email_confirmed_at ? "auth" : "unverified";

    return { status: authStatus, user: authUser };
  }

  // Initial session check
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("[SupabaseAuth] getSession error:", error.message);
      updateState(true, "guest", null);
      return;
    }

    const { status: newStatus, user: newUser } = parseUser(data.session?.user);
    updateState(true, newStatus, newUser);
  });

  // Listen to auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const { status: newStatus, user: newUser } = parseUser(session?.user);
    updateState(true, newStatus, newUser);
  });

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

      // Immediately call with current state
      callback({ ready, status, user });

      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
      };
    },

    async signIn() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("[SupabaseAuth] signIn error:", error.message);
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[SupabaseAuth] signOut error:", error.message);
      }
    },
  };
}