import { AuthContextValue, AuthUser, AuthStatus } from "../auth.types";
import { supabaseBrowser } from "@/lib/supabase/client";

export function createSupabaseAuth(): AuthContextValue {
  const supabase = supabaseBrowser();

  let ready = false;
  let status: AuthStatus = "guest";
  let user: AuthUser | null = null;

  // Initial session check (CRITICAL for OAuth)
  supabase.auth.getSession().then(({ data }) => {
    const sessionUser = data.session?.user;

    if (sessionUser) {
      status = sessionUser.email_confirmed_at ? "auth" : "unverified";
      user = {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: sessionUser.user_metadata?.full_name,
        avatarUrl: sessionUser.user_metadata?.avatar_url,
      };
    } else {
      status = "guest";
      user = null;
    }

    ready = true;
  });

  // Listen to auth state changes (login / logout / OAuth complete)
  supabase.auth.onAuthStateChange((_event, session) => {
    const sessionUser = session?.user;

    if (sessionUser) {
      status = sessionUser.email_confirmed_at ? "auth" : "unverified";
      user = {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: sessionUser.user_metadata?.full_name,
        avatarUrl: sessionUser.user_metadata?.avatar_url,
      };
    } else {
      status = "guest";
      user = null;
    }

    ready = true;
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

    // Google OAuth
    async signIn() {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    },

    async signOut() {
      await supabase.auth.signOut();
    },
  };
}
