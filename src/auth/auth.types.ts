export type AuthStatus = "guest" | "auth" | "unverified";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

/**
 * State shape emitted by auth adapters
 */
export interface AuthState {
  ready: boolean;
  status: AuthStatus;
  user: AuthUser | null;
}

/**
 * Callback type for auth state subscriptions
 */
export type AuthSubscriber = (state: AuthState) => void;

/**
 * Auth adapter interface
 */
export interface AuthAdapter {
  readonly ready: boolean;
  readonly status: AuthStatus;
  readonly user: AuthUser | null;

  subscribe(callback: AuthSubscriber): () => void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

/**
 * @deprecated Use AuthAdapter instead
 * Kept for backward compatibility
 */
export type AuthContextValue = {
  ready: boolean;
  status: AuthStatus;
  user: AuthUser | null;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
};