export type AuthStatus = "guest" | "auth";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export type AuthContextValue = {
  status: "auth" | "guest";
  user: AuthUser | null;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
};


