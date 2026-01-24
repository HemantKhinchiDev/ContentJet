import { AuthContextValue, AuthUser } from "../auth.types";
import { supabaseBrowser } from "@/lib/supabase/client";

export function createSupabaseAuth(): AuthContextValue {
  const supabase = supabaseBrowser();

  return {
    status: "guest",
    user: null,

    async signIn() {
      await supabase.auth.signInWithOAuth({
        provider: "google",
      });
    },

    async signOut() {
      await supabase.auth.signOut();
    },
  };
}
