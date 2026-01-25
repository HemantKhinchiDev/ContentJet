"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContextValue } from "./auth.types";
import { createAuthAdapter } from "./index";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth] = useState(() => createAuthAdapter());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // force re-render when auth state mutates internally
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={auth}>
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
