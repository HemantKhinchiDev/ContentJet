export type AuthStatus = "guest" | "auth" | "unverified";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export type AuthContextValue = {
  /** true = auth adapter has finished initial hydration */
  ready: boolean;

  status: AuthStatus;
  user: AuthUser | null;

  signIn(): Promise<void>;
  signOut(): Promise<void>;
};
