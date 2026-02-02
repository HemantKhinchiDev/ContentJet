"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, AuthStatus } from "./auth.types";
import { createAuthAdapter } from "./index";

/**
 * Internal state shape for the auth context
 */
interface AuthState {
  ready: boolean;
  status: AuthStatus;
  user: AuthUser | null;
}

/**
 * Context value exposed to consumers
 */
interface AuthContextValue {
  ready: boolean;
  status: AuthStatus;
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ready: false,
    status: "guest",
    user: null,
  });

  const [adapter] = useState(() => createAuthAdapter());

  useEffect(() => {
    // Subscribe to auth state changes from the adapter
    const unsubscribe = adapter.subscribe((newState) => {
      setState({
        ready: newState.ready,
        status: newState.status,
        user: newState.user,
      });
    });

    // Initial state sync
    setState({
      ready: adapter.ready,
      status: adapter.status,
      user: adapter.user,
    });

    return () => {
      unsubscribe();
    };
  }, [adapter]);

  const contextValue: AuthContextValue = {
    ready: state.ready,
    status: state.status,
    user: state.user,
    signIn: () => adapter.signIn(),
    signOut: () => adapter.signOut(),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}