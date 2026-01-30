// src/lib/env.ts

/**
 * Environment detection utilities.
 * Used to switch between fake auth (development) and Supabase auth (production).
 */

/**
 * Returns true if running in local development environment.
 * 
 * Checks:
 * 1. NODE_ENV === "development" (works server-side and at build time)
 * 2. Hostname patterns for development environments (works client-side):
 *    - localhost
 *    - 127.0.0.1
 *    - GitHub Codespaces (*.app.github.dev)
 * 
 * This ensures fake auth is NEVER active in production.
 */
export function isDevelopment(): boolean {
  // Server-side / build-time check
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }

  // Client-side check
  const hostname = window.location.hostname;
  
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("localhost:") ||
    hostname.endsWith(".app.github.dev") // GitHub Codespaces
  );
}

/**
 * Returns true if running in production environment.
 */
export function isProduction(): boolean {
  return !isDevelopment();
}