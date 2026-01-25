import { AuthContextValue, AuthUser } from "../auth.types";
import { supabaseBrowser } from "@/lib/supabase/client";

export function createSupabaseAuth(): AuthContextValue {
  const supabase = supabaseBrowser();

  let status: "auth" | "guest" = "guest";
  let user: AuthUser | null = null;

  supabase.auth.getSession().then(({ data }) => {
    const sessionUser = data.session?.user;
    if (sessionUser) {
      status = "auth";
      user = {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: sessionUser.user_metadata?.full_name,
        avatarUrl: sessionUser.user_metadata?.avatar_url,
      };
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const sessionUser = session?.user;
    if (sessionUser) {
      status = "auth";
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
  });

  return {
    get status() {
      return status;
    },
    get user() {
      return user;
    },

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